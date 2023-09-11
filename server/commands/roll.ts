import {
    getDropFromGuild,
    addNewClaim,
    checkWhetherPlayerHasClaimedDrop,
} from '../database/queries';
import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder, Locale } from 'discord.js';
import { Drop } from '../database/drop';
import { getItems } from '../playfab/playfab_catalog';
import { PlayfabItem } from '../playfab/playfab_item';
import { getServerSizeModifier } from '../guilds/guilds';
import { loadImage, createCanvas } from '@napi-rs/canvas';
import axios from 'axios';
import fs from 'fs';
import { getLocalizedText } from '../localization/localization_manager';

const command = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setNameLocalizations({
            en: 'roll',
            ko: 'roll',
            ja: 'roll',
            zh: 'roll',
        } as any)
        .setDescription(`Roll to infiltrate the Baron's Caravan`)
        .setDescriptionLocalizations({
            en: 'Roll to infiltrate the Baron\'s Caravan',
            ko: 'Roll to infiltrate the Baron\'s Caravan',
            ja: 'Roll to infiltrate the Baron\'s Caravan',
            zh: 'Roll to infiltrate the Baron\'s Caravan',
        } as any),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.isChatInputCommand) {
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') {
            console.log('oops! this command was not made in a Discord server. Not processing');
            return;
        }


        const interactionLanguage = interaction.locale;
        const drop = (await getDropFromGuild(interaction.guild?.id as string)) as Drop;

        if (drop === null) {
            console.log('player attempted to raid a caravan server where there are none');
            const responseMessage = getLocalizedText(interactionLanguage, 'command_interactions.roll_command.no_drops') as string;
            await interaction.reply({ content: responseMessage, ephemeral: true });
            return;
        }

        const playerHasAlreadyClaimedDrop = await checkWhetherPlayerHasClaimedDrop(
            drop.drop_id,
            interaction.user.id
        );

        if (playerHasAlreadyClaimedDrop) {
            console.log('player attempted to raid a caravan when they have already raided one');
            const responseMessage = getLocalizedText(interactionLanguage, 'command_interactions.roll_command.already_raided') as string;
            await interaction.reply({ content: responseMessage, ephemeral: true });
            return;
        }

        var d20Diceroll = await get20SidedDiceRoll();
        const responseMessage = getLocalizedText(interactionLanguage, 'command_interactions.roll_command.rolling_dice') as string;
        await interaction.reply({ content: responseMessage, ephemeral: true });

        if (d20Diceroll === 1) { 
            await processNat1Drop(interaction);
        } else {
            await processNormalDrop(interaction, drop, d20Diceroll);
        }   
    },
};

async function processNat1Drop(interaction: ChatInputCommandInteraction) { 
    setTimeout(async () => {
        const responseMessage = getLocalizedText(interaction.locale, 'command_interactions.roll_command.rolled_1') as string;
        await interaction.followUp({
            content: responseMessage,
            ephemeral: true,
        });
    }, 3000);

    const natOneImage = await retrieveNat1Image();
    setTimeout(async () => {
        const randomResponse = getRandomResponse(1, interaction.locale);
        const flavorText = '```css\n[' + `" ${randomResponse} "` + ']\n```';
        const foundNothingResponse = getLocalizedText(interaction.locale, 'command_interactions.roll_command.rolled_1_found') as string;
        const responseMessage = `\n ***${flavorText}*** \n ${foundNothingResponse}\n `;
        await interaction.followUp({
            content: responseMessage,
            files: [natOneImage],
            ephemeral: true,
        });
    }, 7000);
}

async function processNormalDrop(interaction: ChatInputCommandInteraction, drop: Drop, d20Diceroll: number) {
    var serverSize = await getMemberCount(interaction);
    var serverSizeModifier = getServerSizeModifier(serverSize);
    setTimeout(async () => {
        const responseMessageUnformatted = getLocalizedText(interaction.locale, 'command_interactions.roll_command.rolled_result') as string;
        
        const responseMessageFormatted = responseMessageUnformatted
            .replace('{diceroll}', d20Diceroll.toString())
            .replace('{server_size_modifier}', serverSizeModifier.toString())
            .replace('{combined}', (d20Diceroll + serverSizeModifier).toString());
        
        await interaction.followUp({
            content:responseMessageFormatted,
            ephemeral: true,
        });
    }, 3000);

    const reward = await getRewardId(d20Diceroll + serverSizeModifier);
    await addNewClaim(drop.drop_id, interaction.user.id, reward.friendlyId, 'currency');
    const rewardImage = await retrieveAwardImage(reward);

    setTimeout(async () => {
        const randomResponse = getRandomResponse(d20Diceroll, interaction.locale);
        const randomFlavorText = '```css\n[' + `" ${randomResponse} "` + ']\n```';
        const foundSomethingResponseUnformatted = getLocalizedText(interaction.locale, 'command_interactions.roll_command.rolled_found') as string;
        const foundSomethingResponseFormatted = foundSomethingResponseUnformatted
            .replace('{reward_title}', reward.title)

        const responseMessage = `\n ***${randomFlavorText}*** \n ${foundSomethingResponseFormatted} \n `;

        await interaction.followUp({
            content: responseMessage,
            files: [rewardImage],
            ephemeral: true,
        });
    }, 7000);
}

async function getMemberCount(interaction: ChatInputCommandInteraction): Promise<number> {
    console.log('Getting member count...');
    var numberOfGuildMembers = interaction.guild?.members.cache.filter((member) => !member.user.bot).size as number;
    return numberOfGuildMembers;
}

async function get20SidedDiceRoll(): Promise<number> {
    var d20Diceroll = Math.floor(Math.random() * 20) + 1;
    return d20Diceroll;
}

async function getRewardId(d20Diceroll: number): Promise<PlayfabItem> {
    const items = await getItems();

    /// sort items by dice roll requirement descending
    var descendingSortedItems = items.sort((a, b) => b.diceRollRequirement - a.diceRollRequirement);

    for (var i = 0; i < descendingSortedItems.length; i++) {
        console.log(
            'checking item ' + descendingSortedItems[i].friendlyId + ' with diceroll ' + d20Diceroll
        );
        var item = descendingSortedItems[i];
        if (d20Diceroll >= item.diceRollRequirement) {
            console.log('found reward ' + item.friendlyId + ' for diceroll ' + d20Diceroll);
            return item;
        }
    }

    console.log('oops! something went wrong. Could not find a reward for diceroll ' + d20Diceroll);
    return items[0];
}

function getRandomResponse(roll: number, language: Locale): string {
    let response: string | null;
    if (roll === 1) {    
        response = getLocalizedText(language, 'roll_responses.Roll_Nat_1');
    } else if (roll >= 2 && roll <= 10) {
        response = getLocalizedText(language, 'roll_responses.Roll_2_10');
    } else if (roll >= 11 && roll <= 15) {
        response = getLocalizedText(language, 'roll_responses.Roll_11_15');
    } else if (roll >= 16 && roll <= 19) {
        response = getLocalizedText(language, 'roll_responses.Roll_16_19');
    } else if (roll === 20) {
        response = getLocalizedText(language, 'roll_responses.Roll_20');
    } else {
        return 'Invalid roll!';
    }
    
    if (response === null) {
        return 'Invalid roll!';
    }
    return response;
}

async function retrieveAwardImage(item: PlayfabItem): Promise<AttachmentBuilder> {
    const imagePath = `./images/${item.friendlyId}.png`;
    console.log('checking if image exists at ' + imagePath);
    if (!fs.existsSync(`${imagePath}`)) {
        await downloadImage(item.friendlyId, item.imageUrl);
    }

    const itemImage = await loadImage(imagePath);
    const canvas = createCanvas(200, 200);
    const context = canvas.getContext('2d');
    context.drawImage(itemImage, 0, 0, canvas.width, canvas.height);

    const attachment = new AttachmentBuilder(await canvas.encode('png'), {
        name: `${item.friendlyId}.png`,
    });
    return attachment;
}

async function retrieveNat1Image(): Promise<AttachmentBuilder> {
    const imagePath = `./images/result_01.png`;
    console.log('checking if image exists at ' + imagePath);
    const itemImage = await loadImage(imagePath);
    const canvas = createCanvas(200, 200);
    const context = canvas.getContext('2d');
    context.drawImage(itemImage, 0, 0, canvas.width, canvas.height);

    const attachment = new AttachmentBuilder(await canvas.encode('png'), {
        name: `result_01.png`,
    });
    return attachment;
}

async function downloadImage(itemId: string, url: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const imagePath = `./images/${itemId}.png`;
    console.log('saving image to ' + imagePath);
    fs.writeFileSync(imagePath, response.data);
}

export = command;
