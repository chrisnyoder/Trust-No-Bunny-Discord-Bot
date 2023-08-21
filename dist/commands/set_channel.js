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
const discord_js_1 = require("discord.js");
const guilds_1 = require("../guilds");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('channel')
        .setDescription('Sets the default text channel for where drops occur')
        .addSubcommand(subcommand => subcommand
        .setName('set')
        .setDescription('Sets the default text channel for where drops occur')
        .addChannelOption(option => option
        .setName('channel_name')
        .setDescription("Channel you want the TNB bot to post drops in")
        .addChannelTypes(discord_js_1.ChannelType.GuildText)
        .setRequired(true))),
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isChatInputCommand) {
                return;
            }
            if (typeof ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.id) === 'undefined') {
                console.log('oops! this command was not made in a Discord server. Not processing');
                return;
            }
            const channel = interaction.options.getChannel('channel_name');
            (0, guilds_1.setDefaultChannel)((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id, channel);
            const responseMessage = `Default channel for drops has been successfully set`;
            yield interaction.reply({ content: responseMessage, ephemeral: true });
        });
    }
};
module.exports = command;
