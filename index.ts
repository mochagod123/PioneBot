/*
    PioneBOT Main
*/

import { Client, REST, Routes, GatewayIntentBits, SlashCommandBuilder, ActivityType, EmbedBuilder, Colors, ChannelType } from "discord.js";
import dotenv from "dotenv";
import * as db from "./includes/database";
import * as joinImage from "./includes/create-join-image";

dotenv.config();
const token = process.env.DISCORD_TOKEN as string;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: "10" }).setToken(token);
const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")
        .setDescriptionLocalization("ja", "Pong! と返信します。"),
    new SlashCommandBuilder()
        .setName("settings")
        .setDescription("PioneBOT's settings")
        .setDescriptionLocalization("ja", "PioneBOTの設定")
        .addSubcommand(subcommand =>
            subcommand
                .setName("join")
                .setDescription("Join message settings")
                .setDescriptionLocalization("ja", "入室メッセージの設定")
                .addStringOption(option =>
                    option
                        .setName("channel")
                        .setDescription("Channel to send join message")
                        .setDescriptionLocalization("ja", "入室メッセージを送信するチャンネル")
                        .setRequired(true)
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
                        .setName("join_message")
                        .setDescription("Join message")
                        .setDescriptionLocalization("ja", "入室メッセージ")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("bottom_message")
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
    }
});

// Join message
client.on("guildMemberAdd", async member => {
    const serverId = member.guild.id;
    const [rows] = await db.getServerJoinSettings(serverId);
    if (rows.length === 0) return;

    const channelId = rows[0].channel_id;
    const imageTemplate = rows[0].image_template;
    const joinMessage = rows[0].join_message.replace("{user}", member.displayName);
    const bottomMessage = rows[0].bottom_message.replace("{user}", member.displayName);

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel || channel.type != ChannelType.GuildText) return;

    await channel.send({
        "content": `${joinMessage}\n${bottomMessage}`,
        "files": [
            {
                "attachment": await joinImage.createJoinImage(
                    member.avatarURL({
                        "extension": "png",
                        "size": 256
                    }) as string,
                    joinMessage,
                    bottomMessage,
                    imageTemplate
                ),
                "name": `join-${member.id}.png`
            }
        ]
    });
});

client.login(token);