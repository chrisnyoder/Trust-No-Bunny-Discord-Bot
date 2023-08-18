import { ChannelType, Guild, TextChannel } from 'discord.js';
import { addNewGuild, removeGuild, setGuildStatusToActive, retrieveGuildsFromDB } from './database/queries';
import { client } from './bot';
import { getItems } from './playfabCatalog';

var listOfGuilds = new Array<Guild>();
var listOfGuildIds = new Array<string>();
const guildDropTimers: Map<string, NodeJS.Timeout> = new Map();

client.once('ready', () => {
    (async () => {
        console.log("Fetching guilds"); 
        listOfGuildIds = await retrieveGuildsFromDB();
        listOfGuildIds.forEach(id => {
            console.log("searching for guild with guild ID " + id);
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

async function sendMessageOfRandomRewardGrant(guild: Guild)
{ 
    var items = getItems();
    const randomItem = items[Math.floor(Math.random() * items.length)];

    var channels = await guild.channels.fetch();
    channels.filter(channel => channel?.type === ChannelType.GuildText);
    var firstKey = channels.firstKey();
    const channel = guild.channels.cache.get(firstKey as string) as TextChannel;

    console.log('Found channel! ' + channel.name + ' ' + channel.type);

    // Retrieve the title and the image URL
    const title = randomItem.Title.NEUTRAL;
    const imageUrl = randomItem.Images[0].Url;

    // Construct the response message
    const responseMessage = `You earned a ${title}`;
    await channel.send({ content: responseMessage, files: [imageUrl] });
}