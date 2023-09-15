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
const playfab_catalog_1 = require("../playfab/playfab_catalog");
const guilds_1 = require("../guilds/guilds");
const localization_manager_1 = require("../localization/localization_manager");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('droptable')
        .setNameLocalizations({
        "en-US": 'droptable',
        "ko": '드롭테이블',
        "ja": 'ドロップテーブル',
        "zh-CN": '掉落表',
    })
        .setDescription('Gets the dice roll requirements for each item in the drop table')
        .setDescriptionLocalizations({
        "en-US": 'Gets the dice roll requirements for each item in the drop table',
        "ko": '드롭테이블에 있는 각 아이템의 주사위 굴림 요구 사항을 가져옵니다.',
        "ja": 'ドロップテーブルにある各アイテムのダイスロール要件を取得します。',
        "zh-CN": '获取掉落表中每个物品的骰子要求。',
    }),
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
            /// create drop table (normalized as a percentage) based on the player's server size
            var serverSizeWithoutBots = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.filter(member => !member.user.bot).size;
            var items = yield (0, playfab_catalog_1.getItems)();
            var unformattedResponse = (0, localization_manager_1.getLocalizedText)(interaction.locale, 'command_interactions.droptable_command.base_dice_roll_requirements');
            var sortedItems = items.sort((a, b) => (a.diceRollRequirement > b.diceRollRequirement) ? 1 : -1);
            sortedItems.forEach(el => {
                unformattedResponse += `${el.diceRollRequirement}+ -> ${el.title}\n`;
            });
            unformattedResponse += (0, localization_manager_1.getLocalizedText)(interaction.locale, 'command_interactions.droptable_command.server_size_modifier');
            const formattedResponse = unformattedResponse
                .replace('{server_size}', serverSizeWithoutBots.toString())
                .replace('{server_size_modifier}', (0, guilds_1.getServerSizeModifier)(serverSizeWithoutBots).toString());
            yield interaction.reply({ content: formattedResponse, ephemeral: true });
        });
    }
};
module.exports = command;
