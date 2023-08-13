import { Message } from 'discord.js';
import { checkLastClaim, addNewClaim } from '../database/queries'; // Assuming you have these functions in your queries.ts file.
import { SlashCommandBuilder } from 'discord.js';

export const commandData = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim your reward!'), 
    async execute(interaction: any) {
        const items = ['item1', 'item2', 'item3', 'item4'];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        // await addNewClaim(interaction.user.id, randomItem);
        console.log('Claim successful for ' + interaction.user.id + ' with item ' + randomItem + '.');
        await interaction.reply('Claim successful! You earned ' + randomItem);
    } 
}