import mysql from 'mysql2/promise'; // Using mysql2 for promise-based interaction.

// This assumes you have a connection configuration set up somewhere.
import { dbConfig } from '../config';

// Check the last claim date for a user.
export async function checkLastClaim(userId: string): Promise<Date | null> {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT `timestamp` FROM `claims` WHERE `user_id` = ? ORDER BY `timestamp` DESC LIMIT 1', [userId]);

        if ((rows as any[]).length === 0) {
            return null;
        }

        return new Date((rows as any[])[0].timestamp);
    } finally {
        await connection.end();
    }
}

// Add a new claim to the database for a user.
export async function addNewClaim(userId: string, dropItem: string): Promise<void> {

    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('INSERT INTO `tnb_claims` (`user_id`, `drop_name`, `has_been_claimed`) VALUES (?, ?, false)', [userId, dropItem]);
    } finally {
        await connection.end();
    }
}

export async function addNewGuild(guildId: string): Promise<void> {

    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('INSERT INTO `tnb_discord_guilds` (`guild_id`) VALUES (?)', [guildId]);
    } finally {
        await connection.end();
    }
}

export async function removeGuild(guildId: string): Promise<void> {

    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('UPDATE `tnb_discord_guilds` SET `is_active` = 0 WHERE `guild_id` = ?', [guildId]);
    } finally {
        await connection.end();
    }
}

export async function setGuildStatusToActive(guildId: string): Promise<void> 
{ 
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('UPDATE `tnb_discord_guilds` SET `is_active` = 1 WHERE `guild_id` = ?', [guildId]);
    } finally {
        await connection.end();
    }
}

export async function retrieveGuildsFromDB(): Promise<string[]> {

    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT `guild_id` FROM `tnb_guilds` WHERE `is_active` = 1');

        return (rows as any[]).map(row => row.guild_id);
    } finally {
        await connection.end();
    }
}
