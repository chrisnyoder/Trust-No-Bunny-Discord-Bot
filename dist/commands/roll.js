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
const playfab_catalog_1 = require("../playfab/playfab_catalog");
const guilds_1 = require("../guilds/guilds");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll to see how many Silver Karats you get!'),
    execute(interaction) {
        var _a, _b, _c, _d;
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
                console.log('player attempted to roll for a drop in a server where there are none');
                const responseMessage = `I'm sorry, we couldn't find a drop in this server`;
                yield interaction.reply({ content: responseMessage, ephemeral: true });
                return;
            }
            const playerHasAlreadyClaimedDrop = yield (0, queries_1.checkWhetherPlayerHasClaimedDrop)(drop.drop_id, interaction.user.id);
            if (playerHasAlreadyClaimedDrop) {
                console.log('player attempted to roll a drop when they have already claimed one');
                const responseMessage = `I'm sorry, it looks like you've already roll for the current drop for this server. Come back later for more chances.`;
                yield interaction.reply({ content: responseMessage, ephemeral: true });
                return;
            }
            var d20Diceroll = yield get20SidedDiceRoll((_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.memberCount);
            var serverSizeModifier = (0, guilds_1.getServerSizeModifier)((_d = interaction.guild) === null || _d === void 0 ? void 0 : _d.memberCount);
            const reward = yield getRewardId(d20Diceroll + serverSizeModifier);
            yield (0, queries_1.addNewClaim)(drop.drop_id, interaction.user.id, reward.friendlyId, "currency");
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield interaction.reply({ content: 'Rolling a 20 sided dice...', ephemeral: true });
            }), 1000);
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield interaction.reply({
                    content: 'You rolled a ' + d20Diceroll
                        + '! Your server size modifer is ' + serverSizeModifier
                        + ' for a total of ' + (d20Diceroll + serverSizeModifier),
                    ephemeral: true
                });
            }), 3000);
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                const responseMessage = `Congratulations! You received ${reward.title}. You can see this in Trust No Bunny.
            If you haven't connected your Discord account in game, you'll have to do that before you see your reward`;
                yield interaction.reply({ content: responseMessage, ephemeral: true });
            }), 5000);
        });
    }
};
function get20SidedDiceRoll(serverSize) {
    return __awaiter(this, void 0, void 0, function* () {
        var d20Diceroll = Math.floor(Math.random() * 20) + 1;
        return d20Diceroll;
    });
}
function getRewardId(d20Diceroll) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = yield (0, playfab_catalog_1.getItems)();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.diceRollRequirement >= d20Diceroll) {
                return item;
            }
        }
        return items[0];
    });
}
module.exports = command;
