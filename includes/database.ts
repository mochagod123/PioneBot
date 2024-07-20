/*
    PioneBOT Database
*/

import mysql from "mysql2/promise";
import dotenv from "dotenv";

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

function getServerJoinSettings(serverId: string): Promise<mysql.RowDataPacket[]> {
    return connection.query("SELECT * FROM server_join_settings WHERE server_id = ?", [serverId]) as Promise<mysql.RowDataPacket[]>;
}

function setServerJoinSettings(serverId: string, channelId: string, imageTemplate: number, joinMessage: string, bottomMessage:string): Promise<mysql.RowDataPacket[]> {
    return connection.query("INSERT INTO server_join_settings (server_id, channel_id, image_template, join_message, bottom_message) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE channel_id = ?, image_template = ?, join_message = ?, bottom_message = ?", [serverId, channelId, imageTemplate, joinMessage, bottomMessage, channelId, imageTemplate, joinMessage, bottomMessage]) as Promise<mysql.RowDataPacket[]>;
}

export { getConnection, getServerJoinSettings, setServerJoinSettings };