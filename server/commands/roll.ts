import {
    getDropFromGuild,
    addNewClaim,
    checkWhetherPlayerHasClaimedDrop,
} from '../database/queries';
import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { Drop } from '../database/drop';
import { getItems } from '../playfab/playfab_catalog';
import { PlayfabItem } from '../playfab/playfab_item';
import { getServerSizeModifier } from '../guilds/guilds';
import { loadImage, createCanvas } from '@napi-rs/canvas';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import * as jsonData from '../database/roll_responses.json';

const command = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription(`Roll to infiltrate the Baron's Caravan`),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.isChatInputCommand) {
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') {
            console.log('oops! this command was not made in a Discord server. Not processing');
            return;
        }

        const drop = (await getDropFromGuild(interaction.guild?.id as string)) as Drop;

        if (drop === null) {
            console.log('player attempted to roll for a drop in a server where there are none');
            const responseMessage = `I'm sorry, we couldn't find a drop in this server`;
            await interaction.reply({ content: responseMessage, ephemeral: true });
            return;
        }

        const playerHasAlreadyClaimedDrop = await checkWhetherPlayerHasClaimedDrop(
            drop.drop_id,
            interaction.user.id
        );

        if (playerHasAlreadyClaimedDrop) {
            console.log('player attempted to roll a drop when they have already claimed one');
            const responseMessage = `I'm sorry, it looks like you've already raided this caravan. Come back later for more chances.`;
            await interaction.reply({ content: responseMessage, ephemeral: true });
            return;
        }

        var d20Diceroll = await get20SidedDiceRoll();
        await interaction.reply({ content: 'Rolling a 20 sided dice...', ephemeral: true });

        if (d20Diceroll === 1) { 
            await processNat1Drop(interaction);
        } else {
            await processNormalDrop(interaction, drop, d20Diceroll);
        }   
    },
};

async function processNat1Drop(interaction: ChatInputCommandInteraction) { 
    setTimeout(async () => {
        await interaction.followUp({
            content:
                'You rolled a 1! Bad luck, no server modifier applied!' ,
            ephemeral: true,
        });
    }, 3000);

    const natOneImage = await retrieveNat1Image();
    setTimeout(async () => {
        const randomResponse = getRandomResponse(1);
        const blueRandomResponse = '```css\n[' + `" ${randomResponse} "` + ']\n```';
        const responseMessage = `\n ***${blueRandomResponse}*** \n You found nothing! Check back later when the caravan stops again.\n `;
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
        await interaction.followUp({
            content:
                'You rolled a ' +
                d20Diceroll +
                '! Your server size modifer is ' +
                serverSizeModifier +
                ' for a total of ' +
                (d20Diceroll + serverSizeModifier),
            ephemeral: true,
        });
    }, 3000);

    const reward = await getRewardId(d20Diceroll + serverSizeModifier);
    await addNewClaim(drop.drop_id, interaction.user.id, reward.friendlyId, 'currency');
    const rewardImage = await retrieveAwardImage(reward);

    setTimeout(async () => {
        const randomResponse = getRandomResponse(d20Diceroll);
        const blueRandomResponse = '```css\n[' + `" ${randomResponse} "` + ']\n```';
        const responseMessage = `\n ***${blueRandomResponse}*** \n You found ${reward.title}. Redeem in Trust No Bunny (play.friendlypixel.com). Ensure your Discord is connected in-game to see your reward.\n `;
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

function getRandomResponse(roll: number): string {
    let responses: string[];
    if (roll === 1) {
        responses = jsonData.Natural_1;
    } else if (roll >= 2 && roll <= 10) {
        responses = jsonData.Roll_2_10;
    } else if (roll >= 11 && roll <= 15) {
        responses = jsonData.Roll_11_15;
    } else if (roll >= 16 && roll <= 19) {
        responses = jsonData.Roll_16_19;
    } else if (roll === 20) {
        responses = jsonData.Roll_Nat_20;
    } else {
        return 'Invalid roll!';
    }
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
}

async function retrieveAwardImage(item: PlayfabItem): Promise<AttachmentBuilder> {
    const imagePath = path.join(__dirname, `../images/${item.friendlyId}.png`);
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
    const imagePath = path.join(__dirname, `../images/result_01.png`);
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
    const imagePath = path.join(__dirname, `../images/${itemId}.png`);
    console.log('saving image to ' + imagePath);
    fs.writeFileSync(imagePath, response.data);
}

export = command;
