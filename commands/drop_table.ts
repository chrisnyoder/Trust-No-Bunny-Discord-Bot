import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getItems } from '../playfab/playfab_catalog';
import { getServerSizeModifier } from '../guilds/guilds';

const command = {
    data: new SlashCommandBuilder()
        .setName('droptable')
        .setDescription('Gets the dice roll requirements for each item in the drop table')
        .addNumberOption(option => 
            option.setName('server_size')
                .setDescription('Optional parameter to see what drop table would look like for a server of a different size')
                .setRequired(false))
    ,
    async execute(interaction: ChatInputCommandInteraction) {
            
        if (!interaction.isChatInputCommand) { 
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }
        
        /// create drop table (normalized as a percentage) based on the player's server size
        var serverSize = interaction.guild?.memberCount as number;

        if (interaction.options.getNumber('server_size') !== null) { 
            serverSize = interaction.options.getNumber('server_size') as number;   
        }

        var items = await getItems();
        
        var responseMessage = `Here are the dice roll requirements for each item in the drop table for a server of size ${serverSize}:\n\n`

        items.forEach(el => {
            responseMessage += `${el.friendlyId}: ${el.diceRollRequirement} or higher\n`;
        });

        responseMessage += "This server has a size modifier of " + getServerSizeModifier(serverSize) + "\n\n";
        
        await interaction.reply({ content: responseMessage, ephemeral: true })
    }
};

export = command;
