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
        .setDescription('Claim your reward!')
        .addStringOption(option => option
        .setName('reward_name')
        .setDescription("The name of the reward you're claiming")
        .setRequired(true)),
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.id) === 'undefined') {
                console.log('oops! this command was not made in a Discord server. Not processing');
                return;
            }
            const items = (0, playfabCatalog_1.getItems)();
            const titlesList = items.map(item => item.Title.NEUTRAL.toLowerCase());
            const itemInput = interaction.options.getString('Reward Name').toLowerCase();
            if (!titlesList.includes(itemInput)) {
                const responseMessage = `I'm sorry, it looks like you have provided an incorrect item`;
                yield interaction.reply({ content: responseMessage });
                return;
            }
            var item = yield (0, queries_1.checkIfDropExistOnGuild)((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id);
            if (item === null) {
                const responseMessage = `I'm sorry, there are no unclaimed rewards from this server matching the reward you provided`;
                yield interaction.reply({ content: responseMessage });
                return;
            }
            yield (0, queries_1.addNewClaim)(interaction.user.id, item.reward_id);
            yield (0, queries_1.setDropAsClaimed)(item.drop_id);
            console.log('Claim successful for ' + interaction.user.id + ' with item ' + item.reward_id + '.');
            // Construct the response message
            const responseMessage = `Congratulations! You earned a ${item.reward_id}. You can see it in Trust No Bunny.
        If you haven't connected your Discord account in game, you'll have to do that before you see your reward`;
            yield interaction.reply({ content: responseMessage });
        });
    }
};
module.exports = command;
