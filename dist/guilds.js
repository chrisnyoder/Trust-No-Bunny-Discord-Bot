"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const queries_1 = require("./database/queries");
const bot_1 = require("./bot");
const playfabCatalog_1 = require("./playfabCatalog");
var listOfGuilds = new Array();
var listOfGuildIds = new Array();
const guildDropTimers = new Map();
bot_1.client.once('ready', () => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Fetching guilds");
        listOfGuildIds = yield (0, queries_1.retrieveGuildsFromDB)();
        listOfGuildIds.forEach(id => {
            console.log("found guild " + id);
            var guild = bot_1.client.guilds.cache.get(id);
            listOfGuilds.push(guild);
        });
    }))();
});
bot_1.client.on('guildCreate', (guild) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('creating guild ' + guild.id);
    if (!listOfGuildIds.includes(guild.id)) {
        listOfGuildIds.push(guild.id);
        (0, queries_1.addNewGuild)(guild.id, guild.memberCount);
        startTimerForGuild(guild, true);
    }
    else {
        (0, queries_1.setGuildStatusToActive)(guild.id);
        startTimerForGuild(guild, false);
    }
}));
bot_1.client.on('guildDelete', (guild) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('deleting guild ' + guild.id);
    if (listOfGuildIds.includes(guild.id)) {
        listOfGuildIds = listOfGuildIds.filter(id => id !== guild.id);
        (0, queries_1.removeGuild)(guild.id);
    }
}));
function startTimerForGuild(guild, isNew) {
    const guildId = guild.id;
    var duration = null;
    if (isNew) {
        duration = 1 * 60 * 1000;
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
function handleDropForGuild(guild) {
    // Handle the drop logic here
    var items = (0, playfabCatalog_1.getItems)();
    const randomItem = items[Math.floor(Math.random() * items.length)];
    console.log('Dropping random reward to first text channel');
    (() => __awaiter(this, void 0, void 0, function* () {
        var channels = yield guild.channels.fetch();
        channels.filter(channel => (channel === null || channel === void 0 ? void 0 : channel.type) === discord_js_1.ChannelType.GuildText);
        var firstKey = channels.firstKey();
        const channel = yield guild.channels.fetch(firstKey);
        // Retrieve the title and the image URL
        const title = randomItem.Title.NEUTRAL;
        const imageUrl = randomItem.Images[0].Url;
        // Construct the response message
        const responseMessage = `You earned a ${title}`;
        channel.send({ content: responseMessage, files: [imageUrl] });
    }))();
    // At the end, reset the timer
    startTimerForGuild(guild, false);
}
