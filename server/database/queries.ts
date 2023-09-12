import mysql from 'mysql2/promise'; // Using mysql2 for promise-based interaction.

// This assumes you have a connection configuration set up somewhere.
import { dbConfig } from '../config';
import { Drop } from './drop';
import { TNBGuild } from '../guilds/tnbGuild';
import { Guild, GuildManager, TextChannel } from 'discord.js';

// Check the last claim date for a user.
export async function getDropFromGuild(guildId: string): Promise<Drop | null> {
    console.log('getting drop from guild ' + guildId);

    const connection = await mysql.createConnection(dbConfig);

    try {
        const query = await connection.execute('SELECT * FROM `tnb_drops` WHERE `guild_id` = ? ORDER BY drop_time DESC LIMIT 1', [guildId]) as any[];

        const queryData = query[0];

        console.log('query result: ' + JSON.stringify(queryData)); 
        console.log('length of query result: ' + queryData.length);

        /// Cast query to drop type 
        if(queryData.length === 0) return null;
        
        const drop = queryData[0] as Drop;
        return drop;
    } finally {
        await connection.end();
    }
}

export async function checkWhetherPlayerHasClaimedDrop(dropId: string, userId: string): Promise<boolean> { 
    console.log('checking whether player ' + userId + ' has claimed drop ' + dropId);

    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT * FROM `tnb_claims` WHERE `drop_id` = ? AND `player_id` = ?', [dropId, userId]);
        return (rows as any[]).length > 0;
    } finally {
        await connection.end();
    }
}

// Add a new claim to the database for a user.
export async function addNewClaim(dropId: string, userId: string, rewardId: string, rewardType: string, ): Promise<void> {
    console.log('adding new claim for user ' + userId + ' with drop ' + dropId + ' and reward ' + rewardId);

    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('INSERT INTO `tnb_claims` (`drop_id`, `player_id`, `reward_id`, `reward_type`) VALUES (?, ?, ?, ?)', [dropId, userId, rewardId, rewardType]);
    } finally {
        await connection.end();
    }
}

export async function guildIsInDatabase(guildId: string): Promise<boolean> {
    console.log('checking whether guild ' + guildId + ' is in db');
    

    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT * FROM `tnb_discord_guilds` WHERE `guild_id` = ?', [guildId]);
        return (rows as any[]).length > 0;
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
    console.log('removing guild ' + guildId + ' from db');

    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('UPDATE `tnb_discord_guilds` SET `is_active` = 0 WHERE `guild_id` = ?', [guildId]);
    } finally {
        await connection.end();
    }
}

export async function setGuildStatusToActive(guildId: string): Promise<void> { 
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('UPDATE `tnb_discord_guilds` SET `is_active` = 1 WHERE `guild_id` = ?', [guildId]);
    } finally {
        await connection.end();
    }
}

export async function retrieveGuildsFromDB(guildManager: GuildManager): Promise<TNBGuild[]> {

    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT `guild_id`, `channel_id_for_drops`, `time_since_last_drop` FROM `tnb_discord_guilds` WHERE `is_active` = 1');

        const guilds = (rows as any[]).map(row => {
            const guild = guildManager.cache.get(row.guild_id) as Guild;
            
            var guildChannel: TextChannel;
            if (row.channel_id_for_drops === null || guild.channels.cache.get(row.channel_id_for_drops) === undefined) {
                guildChannel = guild.systemChannel as TextChannel;
            } else {
                guildChannel = guild.channels.cache.get(row.channel_id_for_drops) as TextChannel;
            }
           
            return new TNBGuild(guild, guildChannel, row.time_since_last_drop as Date);
        });

        return guilds;
    } finally {
        await connection.end();
    }
}

export async function setDefaultChannelForGuild(guildId: string, channelId: string): Promise<void> { 
    console.log('setting default channel for guild ' + guildId + ' to ' + channelId);

    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('UPDATE `tnb_discord_guilds` SET `channel_id_for_drops` = ? WHERE `guild_id` = ?', [channelId, guildId]);
    } finally {
        await connection.end();
    }
}

export async function insertItemIntoDropTable(guildId: string): Promise<void> { 
    console.log('inserting drop into table for guild ' + guildId);

    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('INSERT INTO `tnb_drops` (`guild_id`)  VALUES (?)', [guildId]);
    } finally {
        await connection.end();
    }
}

export async function updateLastDropTime(guildId: string): Promise<void> {
    console.log('updating last drop time for guild ' + guildId);

    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.execute('UPDATE `tnb_discord_guilds` SET `time_since_last_drop` = NOW() WHERE `guild_id` = ?', [guildId]);
    } finally {
        await connection.end();
    }
}

export async function retrieveUnclaimedDrops(guildId: string): Promise<string[]> { 
    console.log('retrieving unclaimed drops for guild ' + guildId);

    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT DISTINCT `reward_id` FROM `tnb_drops` WHERE `guild_id` = ? AND `has_been_claimed` = false', [guildId]);
        return  (rows as any[]).map(row => row.reward_id);
    } finally {
        await connection.end();
    }
}
