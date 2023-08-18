import mysql from 'mysql2/promise'; // Using mysql2 for promise-based interaction.

// This assumes you have a connection configuration set up somewhere.
import { dbConfig } from '../config';

// Check the last claim date for a user.
export async function checkIfDropExistOnGuild(guildId: string): Promise<any> {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT * FROM `tnb_drops` WHERE `guild_id` = ? AND `has_been_claimed` = false', [guildId]) as any[];

        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }

    } finally {
        await connection.end();
    }
}

export async function setDropAsClaimed(dropId: string) { 
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('UPDATE `tnb_drops` SET `has_been_claimed` = true WHERE `drop_id` = ?', [dropId]);
    } finally {
        await connection.end();
    }
}

// Add a new claim to the database for a user.
export async function addNewClaim(userId: string, reward_id: string, reward_type: string, dropId: string): Promise<void> {

    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('INSERT INTO `tnb_claims` (`drop_id`, `player_id`, `reward_id`, `reward_type`) VALUES (?, ?, ?, ?)', [dropId, userId, reward_id, reward_type]);
    } finally {
        await connection.end();
    }
}

export async function addNewGuild(guildId: string, memberCount: number): Promise<void> {

    const connection = await mysql.createConnection(dbConfig);

    console.log('adding new guild' + guildId + ' to db');

    try {
        await connection.execute('INSERT INTO `tnb_discord_guilds` (`guild_id`, `is_active`, `member_count`, `time_since_last_drop`)  VALUES (?, true, ?, null)', [guildId, memberCount]);
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
        const [rows] = await connection.execute('SELECT `guild_id` FROM `tnb_discord_guilds` WHERE `is_active` = 1');

        return (rows as any[]).map(row => row.guild_id);
    } finally {
        await connection.end();
    }
}

export async function insertItemIntoDropTable(itemId: string, itemType: string, guildId: string): Promise<void> { 
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('INSERT INTO `tnb_drops` (`guild_id`, `reward_id`, `reward_type`)  VALUES (?, ?, ?)', [guildId, itemId, itemType]);
    } finally {
        await connection.end();
    }
}

export async function updateLastDropTime(guildId: string): Promise<void> {
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('UPDATE `tnb_discord_guilds` SET `time_since_last_drop` = NOW() WHERE `guild_id` = ?', [guildId]);
    } finally {
        await connection.end();
    }
}
