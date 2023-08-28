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
exports.setDefaultChannel = void 0;
const queries_1 = require("../database/queries");
const bot_1 = require("../bot");
const tnbGuild_1 = require("./tnbGuild");
var activeTNBGuilds = new Array();
const avatarItemTypes = ["head", "eyes", "ears", "torso", "face_extras", "back", "straps", "nose"];
bot_1.client.once('ready', () => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        activeTNBGuilds = yield (0, queries_1.retrieveGuildsFromDB)(bot_1.client.guilds);
        activeTNBGuilds.forEach(guild => {
            console.log("found guild " + guild.discordGuild.id);
            guild.activateBot();
        });
    }))();
});
bot_1.client.on('guildCreate', (guild) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('creating guild ' + guild.id);
    const matchingTNBGuilds = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guild.id);
    if (matchingTNBGuilds.length === 0) {
        var systemChannel = guild.systemChannel;
        const tnbGuild = new tnbGuild_1.TNBGuild(guild, systemChannel);
        activeTNBGuilds.push(tnbGuild);
        (0, queries_1.addNewGuild)(guild.id, guild.memberCount);
        tnbGuild.activateBot();
    }
    else {
        const tnbGuild = matchingTNBGuilds[0];
        tnbGuild.activateBot();
    }
}));
bot_1.client.on('guildDelete', (guild) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('deleting guild ' + guild.id);
    if (activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guild.id).length > 0) {
        activeTNBGuilds = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id !== guild.id);
        (0, queries_1.removeGuild)(guild.id);
    }
}));
/// When a player joins a guild, check whether the guild has enough members to drop
bot_1.client.on('guildMemberAdd', (member) => __awaiter(void 0, void 0, void 0, function* () {
    const guild = member.guild;
    const tnbGuild = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guild.id);
    if (tnbGuild.length === 0) {
        return;
    }
    tnbGuild[0].guildAddedMember();
}));
/// When a player leaves a guild, check whether the guild has enough members to drop
bot_1.client.on('guildMemberRemove', (member) => __awaiter(void 0, void 0, void 0, function* () {
    const guild = member.guild;
    const tnbGuild = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guild.id);
    if (tnbGuild.length === 0) {
        return;
    }
    tnbGuild[0].guildRemovedMember();
}));
function setDefaultChannel(guildId, channel) {
    const matchingTNBGuilds = activeTNBGuilds.filter(tnbGuild => tnbGuild.discordGuild.id === guildId);
    if (matchingTNBGuilds.length === 0) {
        return;
    }
    matchingTNBGuilds[0].setDefaultChannel(channel);
    (0, queries_1.setDefaultChannelForGuild)(guildId, channel.id);
}
exports.setDefaultChannel = setDefaultChannel;
