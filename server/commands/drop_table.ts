import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getItems } from '../playfab/playfab_catalog';
import { getServerSizeModifier } from '../guilds/guilds';
import { getLocalizedText } from '../localization/localization_manager';

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
        var serverSizeWithoutBots = interaction.guild?.members.cache.filter(member => !member.user.bot).size;

        if (interaction.options.getNumber('server_size') !== null) { 
            serverSizeWithoutBots = interaction.options.getNumber('server_size') as number;   
        }

        var items = await getItems();

        var unformattedResponse = getLocalizedText(interaction.locale, 'command_interactions.droptable_command.base_dice_roll_requirements') as string;

        var sortedItems = items.sort((a, b) => (a.diceRollRequirement > b.diceRollRequirement) ? 1 : -1);

        sortedItems.forEach(el => {
            unformattedResponse += `${el.diceRollRequirement}+ -> ${el.title}\n`;
        });

        unformattedResponse += getLocalizedText(interaction.locale, 'command_interactions.droptable_command.server_size_modifier') as string;

        const formattedResponse = unformattedResponse
            .replace('{server_size}', serverSizeWithoutBots.toString())
            .replace('{server_size_modifier}', getServerSizeModifier(serverSizeWithoutBots).toString());
        
        await interaction.reply({ content: formattedResponse, ephemeral: true })
    }
};

export = command;
