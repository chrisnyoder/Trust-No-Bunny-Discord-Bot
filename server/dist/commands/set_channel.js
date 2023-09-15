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
const guilds_1 = require("../guilds/guilds");
const localization_manager_1 = require("../localization/localization_manager");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('channel')
        .setNameLocalizations({
        "en-US": 'channel',
        "ko": '채널',
        "ja": 'チャンネル',
        "zh-CN": '频道',
    })
        .setDescription("Sets the channel where Count Cornelio's caravan will stop.")
        .setDescriptionLocalizations({
        "en-US": "Sets the channel where Count Cornelio's caravan will stop.",
        "ko": '카운트 코르넬리오의 캐러밴이 멈출 채널을 설정합니다.',
        "ja": 'カウント・コルネリオの店が置かれるチャンネルを設定します。',
        "zh-CN": '设置康特·科尔内利奥的商队将停留的频道。',
    })
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => subcommand
        .setName('set')
        .setNameLocalizations({
        "en-US": 'set',
        "ko": '설정',
        "ja": '設定',
        "zh-CN": '设置',
    })
        .setDescription("Sets the channel where Count Cornelio's caravan will stop.")
        .setDescriptionLocalizations({
        "en-US": "Sets the channel where Count Cornelio's caravan will stop.",
        "ko": '카운트 코르넬리오의 캐러밴이 멈출 채널을 설정합니다.',
        "ja": 'カウント・コルネリオの店が置かれるチャンネルを設定します。',
        "zh-CN": '设置康特·科尔内利奥的商队将停留的频道。',
    })
        .addChannelOption(option => option
        .setName('channel_name')
        .setNameLocalizations({
        "en-US": 'channel',
        "ko": '채널',
        "ja": 'チャンネル',
        "zh-CN": '频道',
    })
        .setDescription("Channel you want Count Cornelio's caravan to stop in")
        .setDescriptionLocalizations({
        "en-US": "Sets the channel where Count Cornelio's caravan will stop.",
        "ko": '카운트 코르넬리오의 캐러밴이 멈출 채널을 선택하세요',
        "ja": 'カウント・コルネリオのキャラバンが停止するチャンネル',
        "zh-CN": '您希望康特·科尔内利奥的商队停留的频道',
    })
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
            const responseMessage = (0, localization_manager_1.getLocalizedText)(interaction.locale, 'command_interactions.channel_set_command.message');
            yield interaction.reply({ content: responseMessage, ephemeral: true });
        });
    }
};
module.exports = command;
