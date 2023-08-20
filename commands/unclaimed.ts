import { retrieveUnclaimedDrops } from '../database/queries'; 
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getItemIds, getItemIdFromName, getNameFromItemId } from '../playfabCatalog';
import { Drop } from '../drop';

const command = {
    data: new SlashCommandBuilder()
        .setName('unclaimed')
        .setDescription('See the list of unclaimed items in this server'),
    async execute(interaction: ChatInputCommandInteraction) {
        
        if (!interaction.isChatInputCommand) { 
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }

        const availableDropIds = await retrieveUnclaimedDrops(interaction.guild?.id as string);
        var listOfItemNames: string[] = [];

        availableDropIds.forEach(el => { listOfItemNames.push(getNameFromItemId(el)) });

        if (listOfItemNames.length === 0) {
            // Construct the response message
            const responseMessage = `The server currently doesn't have any unclaimed drops`;
            await interaction.reply({content: responseMessage})            
        } else { 
            const responseMessage = `Here is the list of unclaimed drops in this server: ${listOfItemNames.toString()}`;
            await interaction.reply({content: responseMessage}) 
        }
    }
};

export = command;