import { getDropFromGuild, addNewClaim, checkWhetherPlayerHasClaimedDrop } from '../database/queries'; 
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Drop } from '../database/drop';
import { getItems } from '../playfab/playfab_catalog';
import { PlayfabItem } from '../playfab/playfab_item';
import { getServerSizeModifier } from '../guilds/guilds';

const command = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll to see how many Silver Karats you get!'),
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
            console.log('player attempted to roll for a drop in a server where there are none');
            const responseMessage = `I'm sorry, we couldn't find a drop in this server`;
            await interaction.reply({ content: responseMessage, ephemeral: true })
            return;
        }

        const playerHasAlreadyClaimedDrop = await checkWhetherPlayerHasClaimedDrop(drop.drop_id, interaction.user.id);
        if (playerHasAlreadyClaimedDrop)
        { 
            console.log('player attempted to roll a drop when they have already claimed one');
            const responseMessage = `I'm sorry, it looks like you've already roll for the current drop for this server. Come back later for more chances.`;
            await interaction.reply({ content: responseMessage, ephemeral: true })
            return;
        } 
        
        var d20Diceroll = await get20SidedDiceRoll(interaction.guild?.memberCount as number);
        var serverSizeModifier = getServerSizeModifier(interaction.guild?.memberCount as number);

        const reward = await getRewardId(d20Diceroll + serverSizeModifier);
        await addNewClaim(drop.drop_id, interaction.user.id, reward.friendlyId, "currency");

        setTimeout(async () => {
            await interaction.reply({ content: 'Rolling a 20 sided dice...', ephemeral: true })
        }, 1000);

        setTimeout(async () => {
            await interaction.reply({
                content: 'You rolled a ' + d20Diceroll
                    + '! Your server size modifer is ' + serverSizeModifier
                    + ' for a total of ' + (d20Diceroll + serverSizeModifier),
                ephemeral: true
            })
        }, 3000);

        setTimeout(async () => {
            const responseMessage = `Congratulations! You received ${reward.title}. You can see this in Trust No Bunny.
            If you haven't connected your Discord account in game, you'll have to do that before you see your reward`;
            await interaction.reply({ content: responseMessage, ephemeral: true })
        }, 5000)
    }
};

async function get20SidedDiceRoll(serverSize: number): Promise<number> {
    var d20Diceroll = Math.floor(Math.random() * 20) + 1;
    return d20Diceroll;    
}

async function getRewardId(d20Diceroll: number): Promise<PlayfabItem> {
    const items = await getItems();

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.diceRollRequirement >= d20Diceroll) {
            return item;
        }
    }

    return items[0];
}

export = command;
