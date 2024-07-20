/*
    PioneBOT Main
*/

import { Client, REST, Routes, GatewayIntentBits, SlashCommandBuilder, ActivityType, EmbedBuilder, Colors, ChannelType, PermissionFlagsBits } from "discord.js";
import dotenv from "dotenv";
import * as db from "./includes/database";
import * as joinImage from "./includes/create-join-image";

dotenv.config();
const token = process.env.DISCORD_TOKEN as string;
const client = new Client({
    intents: [
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.DirectMessagePolls,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessagePolls,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent
    ]
});
const rest = new REST({ version: "10" }).setToken(token);
const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")
        .setDescriptionLocalization("ja", "Pong! と返信します。"),
    new SlashCommandBuilder()
        .setName("server-settings")
        .setDescription("PioneBOT's settings")
        .setDescriptionLocalization("ja", "PioneBOTの設定")
        .setDMPermission(false)
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild +
            PermissionFlagsBits.ManageChannels +
            PermissionFlagsBits.SendMessages
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("join")
                .setDescription("Join message settings")
                .setDescriptionLocalization("ja", "入室メッセージの設定")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("Channel to send join message")
                        .setDescriptionLocalization("ja", "入室メッセージを送信するチャンネル")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addIntegerOption(option =>
                    option
                        .setName("template")
                        .setDescription("Image template number")
                        .setDescriptionLocalization("ja", "画像テンプレート番号")
                        .addChoices(
                            joinImage.templateList.map(template => ({
                                name: template.toString(),
                                value: template
                            }))
                        )
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("join-message")
                        .setDescription("Join message")
                        .setDescriptionLocalization("ja", "入室メッセージ")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("bottom-message")
                        .setDescription("Bottom message")
                        .setDescriptionLocalization("ja", "下部メッセージ")
                        .setRequired(true)
                )
        )
];

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    rest.put(Routes.applicationCommands(client.application?.id as string), { body: commands });

    client.user?.setPresence({
        activities: [
            {
                name: "PioneBOT",
                type: ActivityType.Listening
            }
        ],
        status: "online"
    });
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "ping") {
        await interaction.reply({
            "content": "Pong!",
            "embeds": [
                new EmbedBuilder()
                    .setTitle("Pong!")
                    .addFields([
                        {
                            name: "🏓 メッセージレイテンシ",
                            value: `${Date.now() - interaction.createdTimestamp}ミリ秒`
                        },
                        {
                            name: "💓 APIレイテンシ",
                            value: `${Math.round(client.ws.ping)}ミリ秒`
                        }
                    ])
                    .setTimestamp()
                    .setColor(Colors.Purple)
            ]
        });
    } else if (interaction.commandName === "server-settings") {
        if (interaction.guild === null) return;

        if (interaction.options.getSubcommand() === "join") {
            const channelId = interaction.options.getChannel("channel")?.id as string;
            const imageTemplate = interaction.options.getInteger("template") as number;
            const joinMessage = interaction.options.getString("join-message")?.replace(/\\n/g, "\n") as string;
            const bottomMessage = interaction.options.getString("bottom-message") as string;

            await db.setServerJoinSettings(interaction.guildId as string, channelId, imageTemplate, joinMessage, bottomMessage);

            await interaction.reply({
                "content": "設定を保存しました!\n以下が設定内容とそのプレビューです。",
                "embeds": [
                    new EmbedBuilder()
                        .setTitle("参加メッセージ設定")
                        .addFields([
                            {
                                name: "Channel",
                                value: `<#${channelId}>`
                            },
                            {
                                name: "Image Template",
                                value: imageTemplate.toString() + "番"
                            },
                            {
                                name: "Join Message",
                                value: joinMessage.replace(/{user}/g, "(ユーザー名)")
                            },
                            {
                                name: "Bottom Message",
                                value: bottomMessage
                            }
                        ])
                        .setColor(Colors.Green)
                        .setImage(`attachment://join-${interaction.user.id}.png`)
                ],
                "files": [
                    {
                        "attachment": await joinImage.createJoinImage(
                            interaction.user.avatarURL({
                                "extension": "png",
                                "size": 256
                            }) as string,
                            joinMessage.replace(/{user}/g, interaction.guild.members.cache.get(interaction.user.id)?.displayName as string),
                            bottomMessage,
                            imageTemplate
                        ),
                        "name": `join-${interaction.user.id}.png`
                    }
                ]
            });
        }
    }
});

// Join message
client.on("guildMemberAdd", async member => {
    const serverId = member.guild.id;
    const settings = await db.getServerJoinSettings(serverId);
    if (!settings) return;

    const channelId = settings.channelId;
    const imageTemplate = settings.imageTemplate;
    const joinMessage = settings.joinMessage.replace(/\{user\}/g, member.displayName);
    const bottomMessage = settings.bottomMessage.replace(/\{user\}/g, member.displayName);

    const channel = await member.guild.channels.fetch(channelId);
    if (!channel || channel.type != ChannelType.GuildText) return;
    const avatar = member.user.avatarURL({
        "extension": "png",
        "size": 256
    }) ?? member.user.defaultAvatarURL;

    const image = await joinImage.createJoinImage(
        avatar,
        joinMessage,
        bottomMessage,
        imageTemplate
    );

    await channel.send({
        "files": [
            {
                "attachment": image,
                "name": `join-${member.id}.png`
            }
        ]
    });
});

client.login(token);