/*
    PioneBOT Main
*/

import { Client, REST, Routes, GatewayIntentBits, SlashCommandBuilder, ActivityType, EmbedBuilder, Colors, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import dotenv from "dotenv";
import * as db from "./includes/database";
import * as joinImage from "./includes/create-join-image";
import {helpEmbeds, commandHelpEmbeds} from "./includes/help-embeds";

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
        .setName("help")
        .setDescription("Shows help message")
        .setDescriptionLocalization("ja", "ヘルプメッセージを表示します。")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.SendMessages
        )
        .addStringOption(option =>
            option
                .setName("command")
                .setDescription("Command name")
                .setDescriptionLocalization("ja", "コマンド名")
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")
        .setDescriptionLocalization("ja", "Pong! と返信します。")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.SendMessages
        ),
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
        .addSubcommand(subcommand =>
            subcommand
                .setName("leave")
                .setDescription("Leave message settings")
                .setDescriptionLocalization("ja", "退室メッセージの設定")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("Channel to send leave message")
                        .setDescriptionLocalization("ja", "退室メッセージを送信するチャンネル")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addStringOption(option =>
                    option
                        .setName("leave-message")
                        .setDescription("Leave message")
                        .setDescriptionLocalization("ja", "退室メッセージ")
                        .setRequired(true)
                )
        )
];

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    rest.put(Routes.applicationCommands(client.application?.id as string), { body: commands });

    const updateStatus = () => {
        const servers = client.guilds.cache.size;
        client.user?.setPresence({
            activities: [
                {
                    name: `/help | ${servers}servers | Made with ❤️ by Budō-Tō`,
                    type: ActivityType.Listening
                }
            ],
            status: "online"
        });
    };

    updateStatus();
    setInterval(updateStatus, 60000); // 1 min.
});

// Slash commands
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
        case "ping": {
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
            break;
        }

        case "help": {
            const commandName = interaction.options.getString("command");
            if (!commandName) {
                const page = 1;
                const help = await helpEmbeds[page - 1](client);
                await interaction.reply({
                    "embeds": [help],
                    "components": [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId("help-" + (page - 1))
                                    .setLabel("前へ")
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled((page - 1) < 1),
                                new ButtonBuilder()
                                    .setCustomId("help-" + page)
                                    .setLabel(`${page}/${helpEmbeds.length}`)
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(true),
                                new ButtonBuilder()
                                    .setCustomId("help-" + (page + 1))
                                    .setLabel("次へ")
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled((page + 1) > helpEmbeds.length)
                            )
                    ]
                });
            } else {
                if (Object.prototype.hasOwnProperty.call(commandHelpEmbeds, commandName)) {
                    await interaction.reply({
                        "embeds": [await commandHelpEmbeds[commandName as keyof typeof commandHelpEmbeds](client)]
                    });
                } else {
                    await interaction.reply({
                        "content": "コマンド情報が見つかりませんでした。",
                        "embeds": [
                            new EmbedBuilder()
                                .setTitle("Error")
                                .setDescription("コマンド情報が見つかりませんでした。")
                                .setColor(Colors.Red)
                        ]
                    });
                }
            }
            break;
        }

        case "server-settings": {
            if (interaction.guild === null) return;

            switch (interaction.options.getSubcommand()) {
                case "join": {
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
                    break;
                }

                case "leave": {
                    const channelId = interaction.options.getChannel("channel")?.id as string;
                    const leaveMessage = interaction.options.getString("leave-message")?.replace(/\\n/g, "\n") as string;

                    await db.setServerLeaveSettings(interaction.guildId as string, channelId, leaveMessage);

                    await interaction.reply({
                        "content": "設定を保存しました!\n以下が設定内容です。",
                        "embeds": [
                            new EmbedBuilder()
                                .setTitle("退室メッセージ設定")
                                .addFields([
                                    {
                                        name: "Channel",
                                        value: `<#${channelId}>`
                                    },
                                    {
                                        name: "Leave Message",
                                        value: leaveMessage.replace(/{user}/g, "(ユーザー名)")
                                    }
                                ])
                                .setColor(Colors.Green)
                        ]
                    });
                    break;
                }
            }
            break;
        }
    }
});

// Button interaction
client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith("help-")) {
        if (interaction.user.id !== interaction.message.interaction?.user.id) {
            await interaction.reply({
                "content": "他のユーザーの操作はできません。",
                "ephemeral": true
            });
            return;
        }

        const page = parseInt(interaction.customId.split("-")[1]);

        const help = await helpEmbeds[page](client);
        await interaction.update({
            "embeds": [help],
            "components": [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("help-" + (page - 1))
                            .setLabel("前へ")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page < 1),
                        new ButtonBuilder()
                            .setCustomId("help-" + page)
                            .setLabel(`${page + 1}/${helpEmbeds.length}`)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId("help-" + (page + 1))
                            .setLabel("次へ")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page + 1 > helpEmbeds.length)
                    )
            ]
        });
    }
});

// Join message
client.on("guildMemberAdd", async member => {
    const serverId = member.guild.id;
    const settings = await db.getServerJoinSettings(serverId);
    if (!settings) return;

    const channelId = settings.channelId;
    const imageTemplate = settings.imageTemplate;
    const joinMessage = settings.joinMessage.replace(/{user}/g, member.displayName).replace(/{user_id}/g, member.id);
    const bottomMessage = settings.bottomMessage.replace(/{user}/g, member.displayName).replace(/{user_id}/g, member.id);

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

// Leave message
client.on("guildMemberRemove", async member => {
    const serverId = member.guild.id;
    const settings = await db.getServerLeaveSettings(serverId);
    if (!settings) return;

    const channelId = settings.channelId;
    const leaveMessage = settings.leaveMessage.replace(/{user}/g, member.displayName).replace(/{user_id}/g, member.id);

    const channel = await member.guild.channels.fetch(channelId);
    if (!channel || channel.type != ChannelType.GuildText) return;

    await channel.send(leaveMessage);
});

client.login(token);