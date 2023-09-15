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
const localization_manager_1 = require("../localization/localization_manager");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('help')
        .setNameLocalizations({
        "en-US": 'help',
        "ko": '도움',
        "ja": 'ヘルプ',
        "zh-CN": '帮助',
    })
        .setDescription('Help with the Trust No Bunny bot')
        .setDescriptionLocalizations({
        "en-US": 'Help with the Trust No Bunny bot',
        "ko": 'Trust No Bunny 봇 도움말',
        "ja": 'Trust No Bunny ボットのヘルプ',
        "zh-CN": 'Trust No Bunny 机器人帮助',
    }),
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
            const responseMessageUnformatted = (0, localization_manager_1.getLocalizedText)(interaction.locale, 'command_interactions.help_command.message');
            const responseMessageFormatted = responseMessageUnformatted
                .replace('{roll}', (0, discord_js_1.inlineCode)((0, localization_manager_1.getLocalizedText)(interaction.locale, 'command_interactions.roll_command.name')))
                .replace('{channel_set_command}', (0, discord_js_1.inlineCode)((0, localization_manager_1.getLocalizedText)(interaction.locale, 'command_interactions.channel_set_command.name')));
            yield interaction.reply({ content: responseMessageFormatted, ephemeral: true });
        });
    }
};
module.exports = command;
