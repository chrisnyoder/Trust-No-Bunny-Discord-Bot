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
        const responseMessage = `Trust No Bunny drops random bundles of Silver Karats to be redeemed in Trust No Bunny. Better rewards are more likely to drop in bigger servers. To claim the current drop, use the ${inlineCode(`/claim <item>`)} command. You can only claim the latest drop in a given server, but you there's no limit to the number of servers you can use to redeem rewards. To redeem rewards using your currency, go to play.friendlypixel.com`;
        await interaction.reply({ content: responseMessage, ephemeral: true })
    }
};

export = command;
