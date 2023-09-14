import { SlashCommandBuilder, ChatInputCommandInteraction, inlineCode, PermissionFlagsBits, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { getLocalizedText } from '../localization/localization_manager';

const command = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setNameLocalizations({
            "en-US": 'language',
            "ko": 'language',
            "ja": 'language',
            "zh-CN": 'language',
        } as any)
        .setDescription('Set the language for the bot')
        .setDescriptionLocalizations({
            "en-US": 'Set the language for the bot',
            "ko": 'Set the language for the bot',
            "ja": 'Set the language for the bot',
            "zh-CN": 'Set the language for the bot',
        } as any)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    ,
    async execute(interaction: ChatInputCommandInteraction) {
        
        if (!interaction.isChatInputCommand) { 
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }

        const select = new StringSelectMenuBuilder()
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
            ])
        
        const actionRow = new ActionRowBuilder()
            .addComponents(select);
        
        await interaction.reply({ components: [actionRow] as any, ephemeral: true });
    }
};

export = command;
