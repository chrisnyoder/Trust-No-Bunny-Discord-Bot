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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultChannel = void 0;
const discord_js_1 = require("discord.js");
const queries_1 = require("./database/queries");
const bot_1 = require("./bot");
const playfab_catalog_1 = require("./playfab_catalog");
const canvas_1 = require("@napi-rs/canvas");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
var guilds = new Array();
var guildIds = new Array();
var guildsAndDefaultChannels = {};
const guildDropTimers = new Map();
const avatarItemTypes = ["head", "eyes", "ears", "torso", "face_extras", "back", "straps", "nose"];
bot_1.client.once('ready', () => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        guildsAndDefaultChannels = yield (0, queries_1.retrieveGuildsFromDB)();
        guildIds = Object.keys(guildsAndDefaultChannels);
        guildIds.forEach(id => {
            var guild = bot_1.client.guilds.cache.get(id);
            if (typeof guild !== 'undefined') {
                console.log("found guild " + id);
                startTimerForGuild(guild, true);
                guilds.push(guild);
            }
        });
    }))();
});
bot_1.client.on('guildCreate', (guild) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('creating guild ' + guild.id);
    if (!guildIds.includes(guild.id)) {
        guildIds.push(guild.id);
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
    if (guildIds.includes(guild.id)) {
        guildIds = guildIds.filter(id => id !== guild.id);
        (0, queries_1.removeGuild)(guild.id);
    }
}));
function startTimerForGuild(guild, isNew) {
    const guildId = guild.id;
    var duration = null;
    if (isNew) {
        duration = 10 * 1000;
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
    console.log('Dropping random reward to first text channel');
    processRandomDrop(guild);
    // At the end, reset the timer
    startTimerForGuild(guild, false);
}
function setDefaultChannel(guildId, channel) {
    guildsAndDefaultChannels[guildId] = channel.id;
    (0, queries_1.setDefaultChannelForGuild)(guildId, channel.id);
}
exports.setDefaultChannel = setDefaultChannel;
function processRandomDrop(guild) {
    return __awaiter(this, void 0, void 0, function* () {
        var items = (0, playfab_catalog_1.getItems)();
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const firstTextChannel = yield retrieveTextChannel(guild);
        // Check if we found a text channel
        if (!firstTextChannel) {
            console.error("No text channels found in the guild!");
            return;
        }
        yield updateDropTables(guild, randomItem);
        yield sendMessageOfDropToGuild(guild, randomItem, firstTextChannel);
    });
}
function retrieveTextChannel(guild) {
    return __awaiter(this, void 0, void 0, function* () {
        if (guildsAndDefaultChannels[guild.id] !== null) {
            const channelId = guildsAndDefaultChannels[guild.id];
            const channel = guild.channels.cache.get(channelId);
            return channel;
        }
        var systemChannel = guild.systemChannel;
        return systemChannel;
    });
}
function updateDropTables(guild, randomItem) {
    return __awaiter(this, void 0, void 0, function* () {
        const itemId = randomItem.AlternateIds[0].Value;
        const itemType = randomItem.ContentType;
        yield (0, queries_1.insertItemIntoDropTable)(itemId, itemType, guild.id);
        yield (0, queries_1.updateLastDropTime)(guild.id);
    });
}
function sendMessageOfDropToGuild(guild, randomItem, firstTextChannel) {
    return __awaiter(this, void 0, void 0, function* () {
        // Retrieve the title and the image URL
        const title = randomItem.Title.NEUTRAL;
        const itemId = randomItem.AlternateIds[0].Value;
        const imageUrl = randomItem.Images[0].Url;
        // Construct the response message
        const claimText = (0, discord_js_1.inlineCode)(`/claim <item>`);
        const responseMessage = `A ${title} just dropped! Use ${claimText} to claim it`;
        if (avatarItemTypes.includes(randomItem.ContentType)) {
            const attachment = yield pasteItemOnBodyImage(itemId, imageUrl);
            yield firstTextChannel.send({ content: responseMessage, files: [attachment] });
            fs_1.default.unlinkSync(`./ ${itemId}.png`);
        }
        else {
            yield firstTextChannel.send({ content: responseMessage, files: [imageUrl] });
        }
    });
}
function pasteItemOnBodyImage(itemId, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const bodyImage = yield (0, canvas_1.loadImage)('./body_main.png');
        ;
        if (!fs_1.default.existsSync(`./ ${itemId}.png`)) {
            yield downloadImage(itemId, url);
        }
        const itemImage = yield (0, canvas_1.loadImage)(`./ ${itemId}.png`);
        const canvas = (0, canvas_1.createCanvas)(500, 500);
        const context = canvas.getContext('2d');
        context.drawImage(bodyImage, 0, 0, canvas.width, canvas.height);
        context.drawImage(itemImage, 0, 0, canvas.width, canvas.height);
        const attachment = new discord_js_1.AttachmentBuilder(yield canvas.encode('png'), { name: 'avatar-image.png' });
        return attachment;
    });
}
function downloadImage(itemId, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
        fs_1.default.writeFileSync(`./ ${itemId}.png`, response.data);
    });
}
