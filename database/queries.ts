import mysql from 'mysql2/promise'; // Using mysql2 for promise-based interaction.

// This assumes you have a connection configuration set up somewhere.
import { dbConfig } from '../config';
import { Drop } from './drop';
import { TNBGuild } from '../guilds/tnbGuild';
import { Guild, GuildManager } from 'discord.js';

// Check the last claim date for a user.
export async function getDropFromGuild(guildId: string): Promise<Drop | null> {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const query = await connection.execute('SELECT * FROM `tnb_drops` WHERE `guild_id` = ? ORDER BY drop_time DESC LIMIT 1', [guildId]) as any[];

        /// Cast query to drop type 
        if(query.length === 0) return null;
        
        const drop = query[0] as Drop;
        return drop;
    } finally {
        await connection.end();
    }
}

export async function checkWhetherPlayerHasClaimedDrop(dropId: string, userId: string): Promise<boolean> { 
    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT * FROM `tnb_claims` WHERE `drop_id` = ? AND `player_id` = ?', [dropId, userId]);
        return (rows as any[]).length > 0;
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
export async function addNewClaim(dropId: string, userId: string, rewardId: string, rewardType: string, ): Promise<void> {

    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('INSERT INTO `tnb_claims` (`drop_id`, `player_id`, `reward_id`, `reward_type`) VALUES (?, ?, ?, ?)', [dropId, userId, rewardId, rewardType]);
    } finally {
        await connection.end();
    }
}

export async function addNewGuild(guildId: string, memberCount: number): Promise<void> {

    const connection = await mysql.createConnection(dbConfig);

    console.log('adding new guild ' + guildId + ' to db');

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

export async function retrieveGuildsFromDB(guildManager: GuildManager): Promise<TNBGuild[]> {

    console.log(`DB_HOST: ${dbConfig.host}`);
    console.log(`DB_USER: ${dbConfig.user}`);
    console.log(`DB_DATABASE: ${dbConfig.database}`);   
    console.log(`DB_PASSWORD: ${dbConfig.password}`);

    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT `guild_id`, `channel_id_for_drops` FROM `tnb_discord_guilds` WHERE `is_active` = 1');

        const guilds = (rows as any[]).map(row => {
            const guild = guildManager.cache.get(row.guild_id) as Guild;
            const guildChannel = guild.channels.cache.get(row.channel_id_for_drops) as any;
            return new TNBGuild(guild, guildChannel);
        });

        return guilds;
    } finally {
        await connection.end();
    }
}

export async function setDefaultChannelForGuild(guildId: string, channelId: string): Promise<void> { 
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('UPDATE `tnb_discord_guilds` SET `channel_id_for_drops` = ? WHERE `guild_id` = ?', [channelId, guildId]);
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

export async function retrieveUnclaimedDrops(guildId: string): Promise<string[]> { 
    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT DISTINCT `reward_id` FROM `tnb_drops` WHERE `guild_id` = ? AND `has_been_claimed` = false', [guildId]);
        return  (rows as any[]).map(row => row.reward_id);
    } finally {
        await connection.end();
    }
}
