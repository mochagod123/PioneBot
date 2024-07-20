/*
    PioneBOT Database
*/

import mysql from "mysql2/promise";
import dotenv from "dotenv";

interface ServerJoinSettings {
    serverId: string;
    channelId: string;
    imageTemplate: number;
    joinMessage: string;
    bottomMessage: string;
}

dotenv.config();
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.query("CREATE TABLE IF NOT EXISTS server_join_settings (server_id VARCHAR(20) PRIMARY KEY, channel_id VARCHAR(20), image_template INT, join_message TEXT, bottom_message TEXT)") as Promise<mysql.RowDataPacket[]>;

function getConnection() {
    return connection;
}

function setServerJoinSettings(serverId: string, channelId: string, imageTemplate: number, joinMessage: string, bottomMessage:string): Promise<mysql.RowDataPacket[]> {
    return connection.query("INSERT INTO server_join_settings (server_id, channel_id, image_template, join_message, bottom_message) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE channel_id = ?, image_template = ?, join_message = ?, bottom_message = ?", [serverId, channelId, imageTemplate, joinMessage, bottomMessage, channelId, imageTemplate, joinMessage, bottomMessage]) as Promise<mysql.RowDataPacket[]>;
}

async function getServerJoinSettings(serverId: string): Promise<ServerJoinSettings | null> {
    const [rows] = await connection.query("SELECT * FROM server_join_settings WHERE server_id = ?", [serverId]) as mysql.RowDataPacket[];
    if (rows.length === 0) return null;
    return {
        serverId: rows[0].server_id,
        channelId: rows[0].channel_id,
        imageTemplate: rows[0].image_template,
        joinMessage: rows[0].join_message,
        bottomMessage: rows[0].bottom_message
    };
}

export { getConnection, getServerJoinSettings, setServerJoinSettings };