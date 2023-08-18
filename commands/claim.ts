import { CommandInteraction, MessagePayload } from 'discord.js';
import { checkIfDropExistOnGuild, addNewClaim, setDropAsClaimed } from '../database/queries'; 
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getItems, getItemIds } from '../playfabCatalog';

const command = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim your reward!')
        .addStringOption(option => 
            option
                .setName('reward_name')
                .setDescription("The name of the reward you're claiming")
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        
        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }

        const titlesList = getItemIds();
        const itemInput = (interaction.options.getString('Reward Name') as string).toLowerCase();
        
        if (!titlesList.includes(itemInput))
        {
            console.log('player inputted incorrect item ID');
            const responseMessage = `I'm sorry, it looks like you have provided an incorrect item`;
            await interaction.reply({ content: responseMessage })
            return;
        }
        
        var item = await checkIfDropExistOnGuild(interaction.guild?.id as string);  
        
        if (item === null)
        {
            console.log('player attempted to claim an already-claimed item');
            const responseMessage = `I'm sorry, there are no unclaimed rewards from this server matching the reward you provided`;
            await interaction.reply({ content: responseMessage })
            return;
        }

        await addNewClaim(interaction.user.id, item.reward_id);
        await setDropAsClaimed(item.drop_id);
        console.log('Claim successful for ' + interaction.user.id + ' with item ' + item.reward_id + '.');
    
        // Construct the response message
        const responseMessage = `Congratulations! You earned a ${item.reward_id}. You can see it in Trust No Bunny.
        If you haven't connected your Discord account in game, you'll have to do that before you see your reward`;
        await interaction.reply({content: responseMessage})
    }
};

export = command;
