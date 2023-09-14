import {ButtonStyle, SlashCommandBuilder, ChatInputCommandInteraction, inlineCode, PermissionFlagsBits, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { getLocalizedText } from '../localization/localization_manager';
import { getGuildById } from '../guilds/guilds';
import { setLocaleForGuild } from '../database/queries';

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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction: ChatInputCommandInteraction) {
        
        if (!interaction.isChatInputCommand) { 
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }

        const englishButton = new ButtonBuilder()
            .setCustomId('english_button')
            .setLabel('English')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🇺🇸');
        
        const koreanButton = new ButtonBuilder()
            .setCustomId('korean_button')
            .setLabel('한국어')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🇰🇷');
        
        const japaneseButton = new ButtonBuilder() 
            .setCustomId('japanese_button')
            .setLabel('日本語')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🇯🇵');
        
        const chineseButton = new ButtonBuilder()
            .setCustomId('chinese_button')
            .setLabel('中文')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🇨🇳');
        
        const actionRow = new ActionRowBuilder()
            .addComponents(englishButton, koreanButton, japaneseButton, chineseButton);
        
        const response = await interaction.reply({ components: [actionRow] as any, ephemeral: true });
        const filter = (i: any) => i.customId === 'language_select' && i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter, time: 60000 });
            var newLocale = 'en-us';

            if(confirmation.customId === 'english_button') { 
                await confirmation.update({ content: 'English', components: [] });
                newLocale = 'en-us';
            } else if (confirmation.customId === 'korean_button') {
                await confirmation.update({ content: '한국어', components: [] });
                newLocale = 'ko';
            } else if (confirmation.customId === 'japanese_button') {
                await confirmation.update({ content: '日本語', components: [] });
                newLocale = 'ja';
            } else if (confirmation.customId === 'chinese_button') {
                await confirmation.update({ content: '中文', components: [] });
                newLocale = 'zh-cn';
            }

            await getGuildById(interaction.guild?.id as string)?.setLocale(newLocale);
            await setLocaleForGuild(interaction.guild?.id as string, newLocale);
        } catch {
            console.error('No response after 60 seconds');
        }
    }
};

export = command;
