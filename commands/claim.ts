import { CommandInteraction, MessagePayload } from 'discord.js';
import { checkIfDropExistOnGuild, addNewClaim, setDropAsClaimed } from '../database/queries'; 
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getItemIds, getItemIdFromName } from '../playfabCatalog';
import { Drop } from '../drop';

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
        
        if (!interaction.isChatInputCommand) { 
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }

        const titlesList = getItemIds();
        const itemInput = (interaction.options.getString('reward_name') as string).toLowerCase();
        
        if (!titlesList.includes(itemInput))
        {
            console.log('player inputted incorrect item ID');
            const responseMessage = `I'm sorry, it looks like you have provided an incorrect item`;
            await interaction.reply({ content: responseMessage })
            return;
        }
        
        var itemId = await getItemIdFromName(itemInput);
        var drop = await checkIfDropExistOnGuild(interaction.guild?.id as string, itemId) as Drop;  
        
        if (drop === null)
        {
            console.log('player attempted to claim an already-claimed item');
            const responseMessage = `I'm sorry, there are no unclaimed rewards from this server matching the reward you provided`;
            await interaction.reply({ content: responseMessage })
            return;
        }

        await addNewClaim(drop.drop_id, interaction.user.id, drop.reward_id, drop.reward_type);
        await setDropAsClaimed(drop.drop_id);

        console.log('Claim successful for ' + interaction.user.id + ' with item ' + drop.reward_id + '.');

        // Construct the response message
        const responseMessage = `Congratulations! You earned a ${itemInput}. You can see it in Trust No Bunny.
        If you haven't connected your Discord account in game, you'll have to do that before you see your reward`;
        await interaction.reply({content: responseMessage})
    }
};

export = command;
