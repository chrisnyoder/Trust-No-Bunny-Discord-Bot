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
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('help')
        .setDescription('help with the Trust No Bunny bot'),
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isChatInputCommand) {
                return;
            }
            if (typeof ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.id) === 'undefined') {
                console.log('oops! this command was not made in a Discord server. Not processing');
                return;
            }
            // Construct the response message
            const responseMessage = `Trust No Bunny allows users to roll for currency that can be spent in Trust No Bunny.  To roll for the current drop, use the ${(0, discord_js_1.inlineCode)(`/roll`)} command. You can only claim the latest drop in any given server, but you there's no limit to the number of servers you can use to redeem rewards. To redeem rewards using your currency, go to play.friendlypixel.com`;
            yield interaction.reply({ content: responseMessage, ephemeral: true });
        });
    }
};
module.exports = command;
