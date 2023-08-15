import { CommandInteraction, MessagePayload } from 'discord.js';
import { checkLastClaim, addNewClaim } from '../database/queries'; 
import { SlashCommandBuilder } from 'discord.js';
import { getItems } from '../playfabCatalog';

const command = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim your reward!'),
    async execute(interaction: CommandInteraction) {
        const items = getItems();
        const randomItem = items[Math.floor(Math.random() * items.length)];
       
        await addNewClaim(interaction.user.id, randomItem.Title.NEUTRAL);
        console.log('Claim successful for ' + interaction.user.id + ' with item ' + randomItem + '.');
        
        // Retrieve the title and the image URL
        const title = randomItem.Title.NEUTRAL;
        const imageUrl = randomItem.Images[0].Url;
    
        // Construct the response message
        const responseMessage = `You earned a ${title}`;
        await interaction.reply({content: responseMessage, files: [imageUrl]})
    }
};

export = command;
