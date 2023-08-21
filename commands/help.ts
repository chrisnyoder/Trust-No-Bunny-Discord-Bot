import { SlashCommandBuilder, ChatInputCommandInteraction, inlineCode } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('help with the Trust No Bunny bot'),
    async execute(interaction: ChatInputCommandInteraction) {
        
        if (!interaction.isChatInputCommand) { 
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }

        // Construct the response message
        const responseMessage = `The Trust No Bunny bot is now active in this server! You will 
        receive a random drop every 12-24 hours. If you want to change the channel where drops
        occur, use the ${inlineCode(`/channel set <channel>`)} command. To see the list of unclaimed
        drops in this server, use the ${inlineCode(`/unclaimed`)} command. To claim a drop, use the
        ${inlineCode(`/claim <item>`)} command.`;

        await interaction.reply({ content: responseMessage, ephemeral: true })
    }
};

export = command;
