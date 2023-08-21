import { ChannelType, Guild, TextChannel, AttachmentBuilder, bold, italic, strikethrough, underscore, spoiler, quote, blockQuote, inlineCode } from 'discord.js';
import { addNewGuild, removeGuild, setGuildStatusToActive, retrieveGuildsFromDB, insertItemIntoDropTable, updateLastDropTime, setDefaultChannelForGuild } from './database/queries';
import { client } from './bot';
import { getItems, retrieveBodyImage } from './playfab_catalog';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';    
import axios from 'axios';
import { constants } from 'buffer';

var guilds = new Array<Guild>();
var guildIds = new Array<string>();
export type GuildChannelMap = {
    [guildId: string]: string;  // guildId maps to channelId
};
var guildsAndDefaultChannels: GuildChannelMap = {};
const guildDropTimers: Map<string, NodeJS.Timeout> = new Map();

const avatarItemTypes: string[] = ["head", "eyes", "ears", "torso", "face_extras", "back", "straps", "nose"];

client.once('ready', () => {
    (async () => {
        guildsAndDefaultChannels = await retrieveGuildsFromDB();
        guildIds = Object.keys(guildsAndDefaultChannels);
        guildIds.forEach(id => {
            var guild = client.guilds.cache.get(id) as Guild;            
            if (typeof guild !== 'undefined')
            {
                console.log("found guild " + id);
                startTimerForGuild(guild, true);
                guilds.push(guild);
            }
        })
    })();
});

client.on('guildCreate', async (guild) => { 
    console.log('creating guild ' + guild.id)

    if (!guildIds.includes(guild.id))
    { 
        guildIds.push(guild.id);
        addNewGuild(guild.id, guild.memberCount);
        startTimerForGuild(guild, true);
    } else {
        setGuildStatusToActive(guild.id);
        startTimerForGuild(guild, false);
    }  

    sendStartMessage(guild);
})

client.on('guildDelete', async (guild) => {
    console.log('deleting guild ' + guild.id)

    if (guildIds.includes(guild.id))
    { 
        guildIds = guildIds.filter(id => id !== guild.id);
        removeGuild(guild.id);
    }
})

function startTimerForGuild(guild: Guild, isNew: boolean) {

    const guildId = guild.id;

    var duration = null; 
    if (isNew)
    { 
        duration = 10*1000; 
    }
    else { 
        duration = getRandomDuration();
    }
    
    const timer = setTimeout(() => {
        handleDropForGuild(guild);
    }, duration);
    
    guildDropTimers.set(guildId, timer);
}

function getRandomDuration() {
    // Generate a random time between 12 and 24 hours in milliseconds
    return Math.floor(Math.random() * (12 * 60 * 60 * 1000)) + (12 * 60 * 60 * 1000);
}

function handleDropForGuild(guild: Guild) {
    // Handle the drop logic here
    console.log('Dropping random reward to first text channel');
    processRandomDrop(guild);

    // At the end, reset the timer
    startTimerForGuild(guild, false);
}

export function setDefaultChannel(guildId: string, channel: TextChannel) { 
    guildsAndDefaultChannels[guildId] = channel.id;
    setDefaultChannelForGuild(guildId, channel.id);
}

async function processRandomDrop(guild: Guild) { 
    
    var items = getItems();
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const firstTextChannel = await retrieveTextChannel(guild);

    // Check if we found a text channel
    if (!firstTextChannel) {
        console.error("No text channels found in the guild!");
        return;
    }

    await updateDropTables(guild, randomItem);
    await sendMessageOfDropToGuild(randomItem, firstTextChannel);
}

export async function sendStartMessage(guild: Guild) {
    const firstTextChannel = await retrieveTextChannel(guild);

    const responseMessage = `The Trust No Bunny bot is now active in this server! You will 
    receive a random drop every 12-24 hours. If you want to change the channel where drops
    occur, use the ${inlineCode(`/channel set <channel>`)} command. To see the list of unclaimed
    drops in this server, use the ${inlineCode(`/unclaimed`)} command. To claim a drop, use the
    ${inlineCode(`/claim <item>`)} command.`;

    await firstTextChannel.send({ content: responseMessage });
}

async function retrieveTextChannel(guild: Guild) { 

    if (guildsAndDefaultChannels[guild.id] !== null) { 
        const channelId = guildsAndDefaultChannels[guild.id];
        const channel = guild.channels.cache.get(channelId);
        return channel as TextChannel;
    }

    var systemChannel = guild.systemChannel as TextChannel;
    return systemChannel;
} 

async function updateDropTables(guild: Guild, randomItem: any) { 
    const itemId = randomItem.AlternateIds[0].Value;
    const itemType = randomItem.ContentType;
    await insertItemIntoDropTable(itemId, itemType, guild.id);
    await updateLastDropTime(guild.id);
}

async function sendMessageOfDropToGuild(randomItem: any, firstTextChannel: TextChannel) {
    // Retrieve the title and the image URL
    const title = randomItem.Title.NEUTRAL;
    const itemId = randomItem.AlternateIds[0].Value;
    const imageUrl = randomItem.Images[0].Url;

    // Construct the response message
    const claimText = inlineCode(`/claim <item>`);
    const responseMessage = `A ${title} just dropped! Use ${claimText} to claim it`;

    if (avatarItemTypes.includes(randomItem.ContentType))
    {
        const attachment = await pasteItemOnBodyImage(itemId, imageUrl);
        await firstTextChannel.send({ content: responseMessage, files: [attachment] });
        fs.unlinkSync(`./ ${itemId}.png`);
    } else {
        await firstTextChannel.send({ content: responseMessage, files: [imageUrl] });
    }
}

async function pasteItemOnBodyImage(itemId: string, url: string) { 
    
    const bodyImage = await loadImage('./body_main.png');;
    if(!fs.existsSync(`./ ${itemId}.png`))
    { 
        await downloadImage(itemId, url);
    }

    const itemImage = await loadImage(`./ ${itemId}.png`)
    const canvas = createCanvas(500, 500);
    const context = canvas.getContext('2d');

    context.drawImage(bodyImage, 0, 0, canvas.width, canvas.height);
    context.drawImage(itemImage, 0, 0, canvas.width, canvas.height);

    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'avatar-image.png' }); 
    return attachment;
}

async function downloadImage(itemId: string, url: string): Promise<void>  { 
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(`./ ${itemId}.png`, response.data);
}
