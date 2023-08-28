import { getDropFromGuild, addNewClaim, checkWhetherPlayerHasClaimedDrop } from '../database/queries'; 
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Drop } from '../database/drop';
import { getItems } from '../playfab/playfab_catalog';

const command = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim your item!'),
    async execute(interaction: ChatInputCommandInteraction) {
        
        if (!interaction.isChatInputCommand) { 
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }

        const drop = await getDropFromGuild(interaction.guild?.id as string) as Drop;  
        
        if (drop === null)
        {
            console.log('player attempted to claim a drop in a server where there are none');
            const responseMessage = `I'm sorry, we couldn't find a drop in this server`;
            await interaction.reply({ content: responseMessage, ephemeral: true })
            return;
        }

        const playerHasAlreadyClaimedDrop = await checkWhetherPlayerHasClaimedDrop(drop.drop_id, interaction.user.id);
        if (playerHasAlreadyClaimedDrop)
        { 
            console.log('player attempted to claim a drop when they have already claimed one');
            const responseMessage = `I'm sorry, it looks like you've already claimed the drop for this server`;
            await interaction.reply({ content: responseMessage, ephemeral: true })
            return;
        } 
        
        await addNewClaim(drop.drop_id, interaction.user.id, drop.reward_id, drop.reward_type);
        // await setDropAsClaimed(drop.drop_id);

        console.log('Claim successful for ' + interaction.user.id + ' with item ' + drop.reward_id + '.');

        // Construct the response message
        var itemReceived = getItems().filter(el => el.friendlyId === drop.reward_id)[0];
        const responseMessage = `Congratulations! You earned a ${itemReceived.title}. You can see it in Trust No Bunny.
        If you haven't connected your Discord account in game, you'll have to do that before you see your reward`;
        await interaction.reply({ content: responseMessage, ephemeral: true })
    }
};

export = command;
