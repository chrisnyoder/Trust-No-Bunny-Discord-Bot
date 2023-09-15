import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getItems } from '../playfab/playfab_catalog';
import { getServerSizeModifier } from '../guilds/guilds';
import { getLocalizedText } from '../localization/localization_manager';

const command = {
    data: new SlashCommandBuilder()
        .setName('droptable')
        .setNameLocalizations({
            "en-US": 'droptable',
            "ko": '드롭테이블',
            "ja": 'ドロップテーブル',
            "zh-CN": '掉落表',
        } as any)
        .setDescription('Gets the dice roll requirements for each item in the drop table')
        .setDescriptionLocalizations({
            "en-US": 'Gets the dice roll requirements for each item in the drop table',
            "ko": '드롭테이블에 있는 각 아이템의 주사위 굴림 요구 사항을 가져옵니다.',
            "ja": 'ドロップテーブルにある各アイテムのダイスロール要件を取得します。',
            "zh-CN": '获取掉落表中每个物品的骰子要求。',
        } as any),
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
