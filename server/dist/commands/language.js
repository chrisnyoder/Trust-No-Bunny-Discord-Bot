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
        .setName('language')
        .setNameLocalizations({
        "en-US": 'language',
        "ko": 'language',
        "ja": 'language',
        "zh-CN": 'language',
    })
        .setDescription('Set the language for the bot')
        .setDescriptionLocalizations({
        "en-US": 'Set the language for the bot',
        "ko": 'Set the language for the bot',
        "ja": 'Set the language for the bot',
        "zh-CN": 'Set the language for the bot',
    })
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild),
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
            const select = new discord_js_1.StringSelectMenuBuilder()
                .setCustomId('language_select')
                .addOptions([
                {
                    label: 'English',
                    value: 'en-US',
                    description: 'English',
                    emoji: '🇺🇸'
                },
                {
                    label: '한국어',
                    value: 'ko',
                    description: '한국어',
                    emoji: '🇰🇷'
                },
                {
                    label: '日本語',
                    value: 'ja',
                    description: '日本語',
                    emoji: '🇯🇵'
                },
                {
                    label: '中文',
                    value: 'zh-CN',
                    description: '中文',
                    emoji: '🇨🇳'
                }
            ]);
            const actionRow = new discord_js_1.ActionRowBuilder()
                .addComponents(select);
            yield interaction.reply({ components: [actionRow], ephemeral: true });
        });
    }
};
module.exports = command;
