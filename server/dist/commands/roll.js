"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const queries_1 = require("../database/queries");
const discord_js_1 = require("discord.js");
const playfab_catalog_1 = require("../playfab/playfab_catalog");
const guilds_1 = require("../guilds/guilds");
const canvas_1 = require("@napi-rs/canvas");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const jsonData = __importStar(require("../database/roll_responses.json"));
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('roll')
        .setDescription(`Roll to infiltrate the Baron's Caravan`),
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isChatInputCommand) {
                return;
            }
            if (typeof ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.id) === 'undefined') {
                console.log('oops! this command was not made in a Discord server. Not processing');
                return;
            }
            const drop = (yield (0, queries_1.getDropFromGuild)((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id));
            if (drop === null) {
                console.log('player attempted to roll for a drop in a server where there are none');
                const responseMessage = `I'm sorry, we couldn't find a drop in this server`;
                yield interaction.reply({ content: responseMessage, ephemeral: true });
                return;
            }
            const playerHasAlreadyClaimedDrop = yield (0, queries_1.checkWhetherPlayerHasClaimedDrop)(drop.drop_id, interaction.user.id);
            if (playerHasAlreadyClaimedDrop) {
                console.log('player attempted to roll a drop when they have already claimed one');
                const responseMessage = `I'm sorry, it looks like you've already raided this caravan. Come back later for more chances.`;
                yield interaction.reply({ content: responseMessage, ephemeral: true });
                return;
            }
            var d20Diceroll = yield get20SidedDiceRoll();
            yield interaction.reply({ content: 'Rolling a 20 sided dice...', ephemeral: true });
            if (d20Diceroll === 1) {
                yield processNat1Drop(interaction);
            }
            else {
                yield processNormalDrop(interaction, drop, d20Diceroll);
            }
        });
    },
};
function processNat1Drop(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield interaction.followUp({
                content: 'You rolled a 1! Bad luck, no server modifier applied!',
                ephemeral: true,
            });
        }), 3000);
        const natOneImage = yield retrieveNat1Image();
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            const randomResponse = getRandomResponse(1);
            const blueRandomResponse = '```css\n[' + `" ${randomResponse} "` + ']\n```';
            const responseMessage = `\n ***${blueRandomResponse}*** \n You found nothing! Check back later when the caravan stops again.\n `;
            yield interaction.followUp({
                content: responseMessage,
                files: [natOneImage],
                ephemeral: true,
            });
        }), 7000);
    });
}
function processNormalDrop(interaction, drop, d20Diceroll) {
    return __awaiter(this, void 0, void 0, function* () {
        var serverSize = yield getMemberCount(interaction);
        var serverSizeModifier = (0, guilds_1.getServerSizeModifier)(serverSize);
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield interaction.followUp({
                content: 'You rolled a ' +
                    d20Diceroll +
                    '! Your server size modifer is ' +
                    serverSizeModifier +
                    ' for a total of ' +
                    (d20Diceroll + serverSizeModifier),
                ephemeral: true,
            });
        }), 3000);
        const reward = yield getRewardId(d20Diceroll + serverSizeModifier);
        yield (0, queries_1.addNewClaim)(drop.drop_id, interaction.user.id, reward.friendlyId, 'currency');
        const rewardImage = yield retrieveAwardImage(reward);
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            const randomResponse = getRandomResponse(d20Diceroll);
            const blueRandomResponse = '```css\n[' + `" ${randomResponse} "` + ']\n```';
            const responseMessage = `\n ***${blueRandomResponse}*** \n You found ${reward.title}. Redeem in Trust No Bunny (play.friendlypixel.com). Ensure your Discord is connected in-game to see your reward.\n `;
            yield interaction.followUp({
                content: responseMessage,
                files: [rewardImage],
                ephemeral: true,
            });
        }), 7000);
    });
}
function getMemberCount(interaction) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Getting member count...');
        var numberOfGuildMembers = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.filter((member) => !member.user.bot).size;
        return numberOfGuildMembers;
    });
}
function get20SidedDiceRoll() {
    return __awaiter(this, void 0, void 0, function* () {
        var d20Diceroll = Math.floor(Math.random() * 20) + 1;
        return d20Diceroll;
    });
}
function getRewardId(d20Diceroll) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = yield (0, playfab_catalog_1.getItems)();
        /// sort items by dice roll requirement descending
        var descendingSortedItems = items.sort((a, b) => b.diceRollRequirement - a.diceRollRequirement);
        for (var i = 0; i < descendingSortedItems.length; i++) {
            console.log('checking item ' + descendingSortedItems[i].friendlyId + ' with diceroll ' + d20Diceroll);
            var item = descendingSortedItems[i];
            if (d20Diceroll >= item.diceRollRequirement) {
                console.log('found reward ' + item.friendlyId + ' for diceroll ' + d20Diceroll);
                return item;
            }
        }
        console.log('oops! something went wrong. Could not find a reward for diceroll ' + d20Diceroll);
        return items[0];
    });
}
function getRandomResponse(roll) {
    let responses;
    if (roll === 1) {
        responses = jsonData.Natural_1;
    }
    else if (roll >= 2 && roll <= 10) {
        responses = jsonData.Roll_2_10;
    }
    else if (roll >= 11 && roll <= 15) {
        responses = jsonData.Roll_11_15;
    }
    else if (roll >= 16 && roll <= 19) {
        responses = jsonData.Roll_16_19;
    }
    else if (roll === 20) {
        responses = jsonData.Roll_Nat_20;
    }
    else {
        return 'Invalid roll!';
    }
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
}
function retrieveAwardImage(item) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(`./ ${item.friendlyId}.png`)) {
            yield downloadImage(item.friendlyId, item.imageUrl);
        }
        const itemImage = yield (0, canvas_1.loadImage)(`./ ${item.friendlyId}.png`);
        const canvas = (0, canvas_1.createCanvas)(200, 200);
        const context = canvas.getContext('2d');
        context.drawImage(itemImage, 0, 0, canvas.width, canvas.height);
        const attachment = new discord_js_1.AttachmentBuilder(yield canvas.encode('png'), {
            name: `${item.friendlyId}.png`,
        });
        return attachment;
    });
}
function retrieveNat1Image() {
    return __awaiter(this, void 0, void 0, function* () {
        const itemImage = yield (0, canvas_1.loadImage)('./result_01.png');
        const canvas = (0, canvas_1.createCanvas)(200, 200);
        const context = canvas.getContext('2d');
        context.drawImage(itemImage, 0, 0, canvas.width, canvas.height);
        const attachment = new discord_js_1.AttachmentBuilder(yield canvas.encode('png'), {
            name: `nat1.png`,
        });
        return attachment;
    });
}
function downloadImage(itemId, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
        fs_1.default.writeFileSync(`./ ${itemId}.png`, response.data);
    });
}
module.exports = command;
