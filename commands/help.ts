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
        const responseMessage = `Trust No Bunny allows users to roll for currency that can be spent in Trust No Bunny.  To roll for the current drop, use the ${inlineCode(`/roll`)} command. Use ${inlineCode(`/droptable`)} to see the roll requirements for different currency amounts. You can only claim the latest drop in any given server, but you there's no limit to the number of servers you can use to redeem rewards. To redeem rewards using your currency, go to play.friendlypixel.com`
        await interaction.reply({ content: responseMessage, ephemeral: true })
    }
};

export = command;
