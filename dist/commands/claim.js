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
const queries_1 = require("../database/queries");
const discord_js_1 = require("discord.js");
const playfabCatalog_1 = require("../playfabCatalog");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim your item!')
        .addStringOption(option => option
        .setName('reward_name')
        .setDescription("The name of the reward you're claiming")
        .setRequired(true)),
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
            const titlesList = (0, playfabCatalog_1.getItemIds)();
            const itemInput = interaction.options.getString('reward_name').toLowerCase();
            if (!titlesList.includes(itemInput)) {
                console.log('player inputted incorrect item ID');
                const responseMessage = `I'm sorry, it looks like you have provided an incorrect item`;
                yield interaction.reply({ content: responseMessage });
                return;
            }
            var itemId = yield (0, playfabCatalog_1.getItemIdFromName)(itemInput);
            var drop = yield (0, queries_1.checkIfDropExistOnGuild)((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id, itemId);
            if (drop === null) {
                console.log('player attempted to claim an already-claimed item');
                const responseMessage = `I'm sorry, there are no unclaimed rewards from this server matching the reward you provided`;
                yield interaction.reply({ content: responseMessage });
                return;
            }
            yield (0, queries_1.addNewClaim)(drop.drop_id, interaction.user.id, drop.reward_id, drop.reward_type);
            yield (0, queries_1.setDropAsClaimed)(drop.drop_id);
            console.log('Claim successful for ' + interaction.user.id + ' with item ' + drop.reward_id + '.');
            // Construct the response message
            const responseMessage = `Congratulations! You earned a ${itemInput}. You can see it in Trust No Bunny.
        If you haven't connected your Discord account in game, you'll have to do that before you see your reward`;
            yield interaction.reply({ content: responseMessage });
        });
    }
};
module.exports = command;
