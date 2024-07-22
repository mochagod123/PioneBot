/*
    PioneBOT Help Embeds
*/

import { Client, Colors, EmbedBuilder } from "discord.js";

const helpEmbeds = [
    async (client: Client) => {
        return new EmbedBuilder()
            .setTitle("PioneBOT Help")
            .setDescription(`PioneBOTをお使いいただき、ありがとうございます!\n\n目次\n1. お楽しみ機能\n2. サーバー設定関連\n3. その他\n\nコマンドの詳細は、</help:${(await client.application?.commands.fetch())?.find((command) => command.name === "help")?.id}> command: (コマンド名) で確認できます。`)
            .setColor(Colors.Purple);
    },
    async (client: Client) => {
        return new EmbedBuilder()
            .setTitle("PioneBOT Help | お楽しみ機能")
            .setDescription("お楽しみ機能についてのヘルプです。")
            .setColor(Colors.Purple)
            .addFields(
                // じゃんけん、サイコロは現在未実装
                /*{
                    name: `</janken:${(await client.application?.commands.fetch())?.find((command) => command.name === "janken")?.id}>`,
                    value: "じゃんけんをします。"
                },
                {
                    name: `</dice:${(await client.application?.commands.fetch())?.find((command) => command.name === "dice")?.id}>`,
                    value: "サイコロを振ります。"
                }*/
            );
    },
    async (client: Client) => {
        return new EmbedBuilder()
            .setTitle("PioneBOT Help | サーバー設定関連")
            .setDescription("サーバー設定関連のヘルプです。")
            .setColor(Colors.Purple)
            .addFields(
                {
                    name: `</server-settings join:${(await client.application?.commands.fetch())?.find((command) => command.name === "server-settings")?.id}>`,
                    value: "**参加メッセージの設定をします。**\nchannel: 参加メッセージを送信するチャンネルを設定します。\ntemplate: 送信する画像のテンプレートを選択してください。\njoin-message: 画像上でユーザーアイコンの横に来るメッセージです。\nbottom-message: 画像の下部に表示されるメッセージです。"
                },
                {
                    name: `</server-settings leave:${(await client.application?.commands.fetch())?.find((command) => command.name === "server-settings")?.id}>`,
                    value: "**退出メッセージの設定をします。**\nchannel: 退出メッセージを送信するチャンネルを設定します。\nleave-message: 退出時のメッセージです。"
                }
            );
    },
    async (client: Client) => {
        return new EmbedBuilder()
            .setTitle("PioneBOT Help | その他")
            .setDescription("その他のヘルプです。")
            .setColor(Colors.Purple)
            .addFields(
                {
                    name: `</help:${(await client.application?.commands.fetch())?.find((command) => command.name === "help")?.id}>`,
                    value: "ヘルプを表示します。"
                },
                {
                    name: `</ping:${(await client.application?.commands.fetch())?.find((command) => command.name === "ping")?.id}>`,
                    value: "PioneBOTの応答速度を表示します。"
                }
            );
    },
    () => {
        return new EmbedBuilder()
            .setTitle("PioneBOT Help | 終わりに")
            .setDescription("PioneBOTのヘルプは以上です。\n\n何かご不明点があれば、お気軽にお問い合わせください。\nお問い合わせ先: [ぶどう島](https://discord.gg/Znewtfc8js) PioneBOT開発チャンネル")
            .setColor(Colors.Purple);
    }
];

const commandHelpEmbeds = {
    "help": async (client: Client) => {
        const command = (await client.application?.commands.fetch())?.find((command) => command.name === "help");
        return new EmbedBuilder()
            .setTitle("PioneBOT Help | help")
            .setDescription("ヘルプを表示します。")
            .setColor(Colors.Purple)
            .addFields(
                {
                    name: "使用法",
                    value: `</help:${command?.id}>`
                },
                {
                    name: "オプション",
                    value: "command: コマンド名"
                }
            );
    },
    "ping": async (client: Client) => {
        const command = (await client.application?.commands.fetch())?.find((command) => command.name === "ping");
        return new EmbedBuilder()
            .setTitle("PioneBOT Help | ping")
            .setDescription("PioneBOTの応答速度を表示します。")
            .setColor(Colors.Purple)
            .addFields(
                {
                    name: "使用法",
                    value: `</ping:${command?.id}>`
                }
            );
    },
    "server-settings": async (client: Client) => {
        const command = (await client.application?.commands.fetch())?.find((command) => command.name === "server-settings");
        return new EmbedBuilder()
            .setTitle("PioneBOT Help | server-settings")
            .setDescription("サーバー設定関連のコマンドです。")
            .setColor(Colors.Purple)
            .addFields(
                {
                    name: "使用法",
                    value: `</server-settings join:${command?.id}>\n</server-settings leave:${command?.id}>`
                },
                {
                    name: "オプション",
                    value: "join: \n  channel: 参加メッセージを送信するチャンネルを設定します。\n  template: 送信する画像のテンプレートを選択してください。テンプレートは下の画像の通りです。\n  join-message: 画像上でユーザーアイコンの横に来るメッセージです。\n  bottom-message: 画像の下部に表示されるメッセージです。\nleave: \n  channel: 退出メッセージを送信するチャンネルを設定します。\n  leave-message: 退出時のメッセージです。\n\nメッセージは{user}と{user_id}が指定できます。"
                }
            )
            .setImage("https://github.com/mochagod123/PioneBot/blob/main/assets/join-preview.png?raw=true");
    }
};

export { helpEmbeds, commandHelpEmbeds };