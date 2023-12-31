import { ChannelType, Guild, TextChannel, AttachmentBuilder, bold, italic, strikethrough, underscore, spoiler, quote, blockQuote, inlineCode } from 'discord.js';
import { addNewGuild, removeGuild, setGuildStatusToActive, retrieveGuildsFromDB, guildIsInDatabase, setDefaultChannelForGuild } from '../database/queries';
import { client } from '../bot';
import { TNBGuild } from './tnbGuild';
import { getDefaultLanguage } from '../localization/localization_manager';

var activeTNBGuilds = new Array<TNBGuild>();

client.once('ready', () => {
    (async () => {
        activeTNBGuilds = await retrieveGuildsFromDB(client.guilds); 
        activeTNBGuilds.forEach(guild => {
            console.log("found guild " + guild.discordGuild.id);
            guild.activateBot();
        })
    })();
});

client.on('guildCreate', async (guild) => { 
    console.log('creating guild ' + guild.id)

    const matchingTNBGuilds = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guild.id);
    if (matchingTNBGuilds.length === 0) { 
        var systemChannel = guild.systemChannel as TextChannel;
        var locale = await getDefaultLanguage(guild.id)

        const tnbGuild = new TNBGuild(guild, systemChannel, null, locale);
        activeTNBGuilds.push(tnbGuild);

        if (await guildIsInDatabase(guild.id)) {
            console.log('guild ' + guild.id + ' is already in the database')
            setGuildStatusToActive(guild.id);
        } else {
            console.log('adding guild ' + guild.id + ' to the database')
            addNewGuild(guild.id, guild.memberCount, locale);
        }
        
        tnbGuild.activateBot();
        tnbGuild.sendStartMessage();
    } else {
        const tnbGuild = matchingTNBGuilds[0];
        tnbGuild.activateBot();
        tnbGuild.sendStartMessage();
    }
})

client.on('guildDelete', async (guild) => {
    console.log('deleting guild ' + guild.id)

    if (activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guild.id).length > 0) {
        activeTNBGuilds = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id !== guild.id);
        removeGuild(guild.id);
    }
})

/// When a player joins a guild, check whether the guild has enough members to drop
client.on('guildMemberAdd', async (member) => {
    const guild = member.guild;
    const tnbGuild = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guild.id)
    if (tnbGuild.length === 0) {
        return;
    }
    tnbGuild[0].guildAddedMember();
})

/// When a player leaves a guild, check whether the guild has enough members to drop
client.on('guildMemberRemove', async (member) => {
    const guild = member.guild;
    const tnbGuild = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guild.id);
    if (tnbGuild.length === 0) {
        return;
    }
    tnbGuild[0].guildRemovedMember();
})

export function setDefaultChannel(guildId: string, channel: TextChannel) { 
    const matchingTNBGuilds = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guildId);
    if (matchingTNBGuilds.length === 0) {
        return;
    }
    matchingTNBGuilds[0].setDefaultChannel(channel);
    setDefaultChannelForGuild(guildId, channel.id);
}

export function getServerSizeModifier(serverSize: number) { 
    if (serverSize > 10000) return 4;
    else if (serverSize > 1000) return 3;
    else if (serverSize > 100) return 2;
    return 0;
}

export function getGuildById(guildId: string): TNBGuild | null {
    const matchingTNBGuilds = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guildId);
    if (matchingTNBGuilds.length === 0) {
        return null;
    }
    return matchingTNBGuilds[0];
}