/*
    PioneBOT Main
*/

import { Client, REST, Routes, GatewayIntentBits, SlashCommandBuilder, ActivityType, EmbedBuilder, Colors } from "discord.js";
import dotenv from "dotenv";

dotenv.config();
const token = process.env.DISCORD_TOKEN as string;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: "10" }).setToken(token);
const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")
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
                            name: "🏓 Latency",
                            value: `${Date.now() - interaction.createdTimestamp}ms`
                        },
                        {
                            name: "💓 API Latency",
                            value: `${Math.round(client.ws.ping)}ms`
                        }
                    ])
                    .setTimestamp()
                    .setColor(Colors.Purple)
            ]
        });
    }
});

client.login(token);