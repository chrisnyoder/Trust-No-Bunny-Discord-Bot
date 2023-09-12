import { SlashCommandBuilder, ChatInputCommandInteraction, inlineCode, ChannelType, TextChannel, PermissionFlagsBits } from 'discord.js';
import { setDefaultChannel } from '../guilds/guilds';
import { getLocalizedText } from '../localization/localization_manager';

const command = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setNameLocalizations({
            "en-US": 'channel',
            "ko": '채널',
            "ja": 'チャンネル',
            "zh-CN": '频道',
        } as any)
        .setDescription("Sets the channel where Count Cornelio's caravan will stop.")
        .setDescriptionLocalizations({
            "en-US": "Sets the channel where Count Cornelio's caravan will stop.",
            "ko": '카운트 코르넬리오의 캐러밴이 멈출 채널을 설정합니다.',
            "ja": 'カウント・コルネリオの店が置かれるチャンネルを設定します。',
            "zh-CN": '设置康特·科尔内利奥的商队将停留的频道。',
        } as any)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => 
            subcommand
                .setName('set')
                .setNameLocalizations({
                    "en-US": 'set',
                    "ko": '설정',
                    "ja": '設定',
                    "zh-CN": '设置',
                } as any)
                .setDescription("Sets the channel where Count Cornelio's caravan will stop.")
                .setDescriptionLocalizations({
                    "en-US": "Sets the channel where Count Cornelio's caravan will stop.",
                    "ko": '카운트 코르넬리오의 캐러밴이 멈출 채널을 설정합니다.',
                    "ja": 'カウント・コルネリオの店が置かれるチャンネルを設定します。',
                    "zh-CN": '设置康特·科尔内利奥的商队将停留的频道。',
                } as any)
                .addChannelOption(option =>
                    option
                        .setName('channel_name')
                        .setNameLocalizations({
                            "en-US": 'channel',
                            "ko": '채널',
                            "ja": 'チャンネル',
                            "zh-CN": '频道',
                        } as any)
                        .setDescription("Channel you want Count Cornelio's caravan to stop in")
                        .setDescriptionLocalizations({
                            "en-US": "Sets the channel where Count Cornelio's caravan will stop.",
                            "ko": '카운트 코르넬리오의 캐러밴이 멈출 채널을 선택하세요',
                            "ja": 'カウント・コルネリオのキャラバンが停止するチャンネル',
                            "zh-CN": '您希望康特·科尔内利奥的商队停留的频道',
                        } as any)
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))),
    async execute(interaction: ChatInputCommandInteraction) {
        
        if (!interaction.isChatInputCommand) { 
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }
        
        const channel = interaction.options.getChannel('channel_name') as TextChannel;
        setDefaultChannel(interaction.guild?.id as string, channel);

        const responseMessage = getLocalizedText(interaction.locale, 'command_interactions.channel_set_command.message') as string;
        await interaction.reply({content: responseMessage, ephemeral: true})      
    }
};

export = command;