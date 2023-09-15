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
const guilds_1 = require("../guilds/guilds");
const queries_1 = require("../database/queries");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('language')
        .setNameLocalizations({
        "en-US": 'language',
        "ko": '언어',
        "ja": '言語',
        "zh-CN": '语言',
    })
        .setDescription('Set the language for the bot')
        .setDescriptionLocalizations({
        "en-US": 'Set the language for the bot',
        "ko": '봇의 언어를 설정합니다',
        "ja": 'ボットの言語を設定する',
        "zh-CN": '设置机器人的语言',
    })
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild),
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
            const englishButton = new discord_js_1.ButtonBuilder()
                .setCustomId('english_button')
                .setLabel('English')
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setEmoji('🇺🇸');
            const koreanButton = new discord_js_1.ButtonBuilder()
                .setCustomId('korean_button')
                .setLabel('한국어')
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setEmoji('🇰🇷');
            const japaneseButton = new discord_js_1.ButtonBuilder()
                .setCustomId('japanese_button')
                .setLabel('日本語')
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setEmoji('🇯🇵');
            const chineseButton = new discord_js_1.ButtonBuilder()
                .setCustomId('chinese_button')
                .setLabel('中文')
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setEmoji('🇨🇳');
            const actionRow = new discord_js_1.ActionRowBuilder()
                .addComponents(englishButton, koreanButton, japaneseButton, chineseButton);
            const response = yield interaction.reply({ components: [actionRow], ephemeral: true });
            const filter = (i) => i.user.id === interaction.user.id;
            try {
                const confirmation = yield response.awaitMessageComponent({ filter, time: 60000 });
                var newLocale = 'en-us';
                if (confirmation.customId === 'english_button') {
                    yield confirmation.update({ content: 'English', components: [] });
                    newLocale = 'en-us';
                }
                else if (confirmation.customId === 'korean_button') {
                    yield confirmation.update({ content: '한국어', components: [] });
                    newLocale = 'ko';
                }
                else if (confirmation.customId === 'japanese_button') {
                    yield confirmation.update({ content: '日本語', components: [] });
                    newLocale = 'ja';
                }
                else if (confirmation.customId === 'chinese_button') {
                    yield confirmation.update({ content: '中文', components: [] });
                    newLocale = 'zh-cn';
                }
                (_c = (0, guilds_1.getGuildById)((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id)) === null || _c === void 0 ? void 0 : _c.setLocale(newLocale);
                yield (0, queries_1.setLocaleForGuild)((_d = interaction.guild) === null || _d === void 0 ? void 0 : _d.id, newLocale);
                const languageSetText = (0, localization_manager_1.getLocalizedText)(newLocale, 'command_interactions.language_command.language_set');
                confirmation.update({ content: languageSetText, components: [] });
            }
            catch (_e) {
                console.error('No response after 60 seconds');
            }
        });
    }
};
module.exports = command;
