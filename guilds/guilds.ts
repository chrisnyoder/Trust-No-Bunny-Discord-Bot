import { ChannelType, Guild, TextChannel, AttachmentBuilder, bold, italic, strikethrough, underscore, spoiler, quote, blockQuote, inlineCode } from 'discord.js';
import { addNewGuild, removeGuild, setGuildStatusToActive, retrieveGuildsFromDB, insertItemIntoDropTable, updateLastDropTime, setDefaultChannelForGuild } from '../database/queries';
import { client } from '../bot';
import { TNBGuild} from './tnbGuild';

var activeTNBGuilds = new Array<TNBGuild>();

const avatarItemTypes: string[] = ["head", "eyes", "ears", "torso", "face_extras", "back", "straps", "nose"];

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
        const tnbGuild = new TNBGuild(guild, systemChannel);
        activeTNBGuilds.push(tnbGuild);
        addNewGuild(guild.id, guild.memberCount);
        tnbGuild.activateBot();
        tnbGuild.sendStartMessage();
    } else {
        const tnbGuild = matchingTNBGuilds[0];
        tnbGuild.activateBot();
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
