import { CommandInteraction } from 'discord.js';
import { checkLastClaim, addNewClaim } from '../database/queries'; 
import { SlashCommandBuilder } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim your reward!'),
    async execute(interaction: CommandInteraction) {
        const items = ['item1', 'item2', 'item3', 'item4'];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        await addNewClaim(interaction.user.id, randomItem);
        console.log('Claim successful for ' + interaction.user.id + ' with item ' + randomItem + '.');
        await interaction.reply('Claim successful! You earned ' + randomItem);
    }
};

export = command;
