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
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim your item!'),
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
            const drop = yield (0, queries_1.getDropFromGuild)((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id);
            if (drop === null) {
                console.log('player attempted to claim a drop in a server where there are none');
                const responseMessage = `I'm sorry, we couldn't find a drop in this server`;
                yield interaction.reply({ content: responseMessage });
                return;
            }
            const playerHasAlreadyClaimedDrop = yield (0, queries_1.checkWhetherPlayerHasClaimedDrop)(drop.drop_id, interaction.user.id);
            if (playerHasAlreadyClaimedDrop) {
                console.log('player attempted to claim a drop when they have already claimed one');
                const responseMessage = `I'm sorry, it looks like you've already claimed the drop for this server`;
                yield interaction.reply({ content: responseMessage });
                return;
            }
            yield (0, queries_1.addNewClaim)(drop.drop_id, interaction.user.id, drop.reward_id, drop.reward_type);
            // await setDropAsClaimed(drop.drop_id);
            console.log('Claim successful for ' + interaction.user.id + ' with item ' + drop.reward_id + '.');
            // Construct the response message
            const responseMessage = `Congratulations! You earned a ${drop.reward_id}. You can see it in Trust No Bunny.
        If you haven't connected your Discord account in game, you'll have to do that before you see your reward`;
            yield interaction.reply({ content: responseMessage, ephemeral: true });
        });
    }
};
module.exports = command;
