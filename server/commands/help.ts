import { SlashCommandBuilder, ChatInputCommandInteraction, inlineCode } from 'discord.js';
import { getLocalizedText } from '../localization/localization_manager';

const command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help with the Count Cornelio bot'),
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
            .replace('{roll}', inlineCode(getLocalizedText(interaction.locale, 'command_interactions.roll_command.name') as string))
            .replace('{channel_set_command}', inlineCode(getLocalizedText(interaction.locale, 'command_interactions.channel_set_command.name') as string));

        await interaction.reply({ content: responseMessageFormatted, ephemeral: true })
    }
};

export = command;
