import { Guild } from 'discord.js';
import { addNewGuild, removeGuild, setGuildStatusToActive, retrieveGuildsFromDB } from './database/queries';
import { client } from './bot';
import { getItems } from './playfabCatalog';

var listOfGuilds = new Array<Guild>();
var listOfGuildIds = new Array<string>();
const guildDropTimers: Map<string, NodeJS.Timeout> = new Map();

client.once('ready', () => {
    (async () => {
        listOfGuildIds = await retrieveGuildsFromDB();
    })();
});

client.on('guildCreate', async (guild) => { 
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
        duration = 5*60*1000; 
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
    var items = getItems();
    const randomItem = items[Math.floor(Math.random() * items.length)];
    
    // At the end, reset the timer
    startTimerForGuild(guild, false);
}