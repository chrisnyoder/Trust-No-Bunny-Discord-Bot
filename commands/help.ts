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
        const responseMessage = `The Trust No Bunny bot is now active in this server! Random drops will now occur in this server. To claim the current drop, use the ${inlineCode(`/claim <item>`)} command. To redeem rewards using your currency, go to play.friendlypixel.com`;
        await interaction.reply({ content: responseMessage, ephemeral: true })
    }
};

export = command;
