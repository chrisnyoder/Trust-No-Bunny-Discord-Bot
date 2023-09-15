import { SlashCommandBuilder, ChatInputCommandInteraction, inlineCode } from 'discord.js';
import { getLocalizedText } from '../localization/localization_manager';

const command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setNameLocalizations({
            "en-US": 'help',
            "ko": '도움',
            "ja": 'ヘルプ',
            "zh-CN": '帮助',
        } as any)
        .setDescription('Help with the Trust No Bunny bot')
        .setDescriptionLocalizations({
            "en-US": 'Help with the Trust No Bunny bot',
            "ko": 'Trust No Bunny 봇 도움말',
            "ja": 'Trust No Bunny ボットのヘルプ',
            "zh-CN": 'Trust No Bunny 机器人帮助',
        } as any),
    async execute(interaction: ChatInputCommandInteraction) {
        
        if (!interaction.isChatInputCommand) { 
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }

        // Construct the response message
        const responseMessageUnformatted = getLocalizedText(interaction.locale, 'command_interactions.help_command.message') as string;
        
        const responseMessageFormatted = responseMessageUnformatted
            .replace('{roll_command}', inlineCode(getLocalizedText(interaction.locale, 'command_interactions.roll_command.name') as string))
            .replace('{channel_set_command}', inlineCode(getLocalizedText(interaction.locale, 'command_interactions.channel_set_command.name') as string))
            .replace('{droptable_command}', inlineCode(getLocalizedText(interaction.locale, 'command_interactions.droptable_command.name') as string));

        await interaction.reply({ content: responseMessageFormatted, ephemeral: true })
    }
};

export = command;
