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
        const responseMessage = `When the Trust No Bunny bot is installed in your server, the nefarious Count Cornelio’s caravan will start making stops here. When he makes a stop, use the ${inlineCode(`/roll`)} command to raid his caravan. Use ${inlineCode(`/droptable`)} to see what the roll amounts grant you. You can only raid a caravan once each time it stops by, but there's no limit to the number of servers you can use to redeem rewards. To redeem rewards using your ill-gotten gains, go to play.friendlypixel.com`
        await interaction.reply({ content: responseMessage, ephemeral: true })
    }
};

export = command;
