import { ChannelType, Guild, TextChannel, bold, italic, strikethrough, underscore, spoiler, quote, blockQuote, inlineCode } from 'discord.js';
import { addNewGuild, removeGuild, setGuildStatusToActive, retrieveGuildsFromDB, insertItemIntoDropTable, updateLastDropTime } from './database/queries';
import { client } from './bot';
import { getItems } from './playfabCatalog';

var listOfGuilds = new Array<Guild>();
var listOfGuildIds = new Array<string>();
const guildDropTimers: Map<string, NodeJS.Timeout> = new Map();

client.once('ready', () => {
    (async () => {
        listOfGuildIds = await retrieveGuildsFromDB();
        listOfGuildIds.forEach(id => {
            var guild = client.guilds.cache.get(id) as Guild;            
            if (typeof guild !== 'undefined')
            {
                console.log("found guild " + id);
                startTimerForGuild(guild, true);
                listOfGuilds.push(guild);
            }
            }
        )
    })();
});

client.on('guildCreate', async (guild) => { 
    console.log('creating guild ' + guild.id)

    if (!listOfGuildIds.includes(guild.id))
    { 
        listOfGuildIds.push(guild.id);
        addNewGuild(guild.id, guild.memberCount);
        startTimerForGuild(guild, true);
    } else {
        setGuildStatusToActive(guild.id);
        startTimerForGuild(guild, false);
    }  
})

client.on('guildDelete', async (guild) => {
    console.log('deleting guild ' + guild.id)

    if (listOfGuildIds.includes(guild.id))
    { 
        listOfGuildIds = listOfGuildIds.filter(id => id !== guild.id);
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
    sendMessageOfRandomRewardGrant(guild);

    // At the end, reset the timer
    startTimerForGuild(guild, false);
}

async function sendMessageOfRandomRewardGrant(guild: Guild) { 
    var items = getItems();
    const randomItem = items[Math.floor(Math.random() * items.length)];

    var textChannels = await guild.channels.fetch();
    textChannels = textChannels.filter(channel => channel?.type === ChannelType.GuildText);
    const firstTextChannel = textChannels.first() as TextChannel;

    // Check if we found a text channel
    if (!firstTextChannel) {
        console.error("No text channels found in the guild!");
        return;
    }

    const itemId = randomItem.AlternateIds[0].Value;
    const itemType = randomItem.ContentType;
    await insertItemIntoDropTable(itemId, itemType, guild.id);
    await updateLastDropTime(guild.id);

    // Retrieve the title and the image URL
    const title = randomItem.Title.NEUTRAL;
    const imageUrl = randomItem.Images[0].Url;

    // Construct the response message
    const claimText = inlineCode(`/claim <item>`);
    const responseMessage = `A ${title} just dropped! Use ${claimText} to claim it`;
    await firstTextChannel.send({ content: responseMessage, files: [imageUrl] });
}