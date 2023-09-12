"use strict";
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
const localization_manager_1 = require("../localization/localization_manager");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('roll')
        .setNameLocalizations({
        "en-US": 'roll',
        "ko": '주사위',
        "ja": 'サイコロ',
        "zh-CN": '掷骰',
    })
        .setDescription(`Roll to infiltrate the Baron's Caravan`)
        .setDescriptionLocalizations({
        "en-US": 'Roll a 20-sided dice to infiltrate the Baron\'s Caravan',
        "ko": '바론의 짐마차에 침투하기 위해 20면 주사위를 굴립니다',
        "ja": 'バロンのキャラバンに侵入するために20面のサイコロを振る',
        "zh-CN": '投掷20面骰子以渗透男爵的商队',
    }),
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
            const interactionLanguage = interaction.locale;
            const drop = (yield (0, queries_1.getDropFromGuild)((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id));
            if (drop === null) {
                console.log('player attempted to raid a caravan server where there are none');
                const responseMessage = (0, localization_manager_1.getLocalizedText)(interactionLanguage, 'command_interactions.roll_command.no_drops');
                yield interaction.reply({ content: responseMessage, ephemeral: true });
                return;
            }
            const playerHasAlreadyClaimedDrop = yield (0, queries_1.checkWhetherPlayerHasClaimedDrop)(drop.drop_id, interaction.user.id);
            if (playerHasAlreadyClaimedDrop) {
                console.log('player attempted to raid a caravan when they have already raided one');
                const responseMessage = (0, localization_manager_1.getLocalizedText)(interactionLanguage, 'command_interactions.roll_command.already_raided');
                yield interaction.reply({ content: responseMessage, ephemeral: true });
                return;
            }
            var d20Diceroll = yield get20SidedDiceRoll();
            const responseMessage = (0, localization_manager_1.getLocalizedText)(interactionLanguage, 'command_interactions.roll_command.rolling_dice');
            yield interaction.reply({ content: responseMessage, ephemeral: true });
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
            const responseMessage = (0, localization_manager_1.getLocalizedText)(interaction.locale, 'command_interactions.roll_command.rolled_1');
            yield interaction.followUp({
                content: responseMessage,
                ephemeral: true,
            });
        }), 3000);
        const natOneImage = yield retrieveNat1Image();
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            const randomResponse = getRandomResponse(1, interaction.locale);
            const flavorText = '```css\n[' + `" ${randomResponse} "` + ']\n```';
            const foundNothingResponse = (0, localization_manager_1.getLocalizedText)(interaction.locale, 'command_interactions.roll_command.rolled_1_found');
            const responseMessage = `\n ***${flavorText}*** \n ${foundNothingResponse}\n `;
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
            const responseMessageUnformatted = (0, localization_manager_1.getLocalizedText)(interaction.locale, 'command_interactions.roll_command.rolled_result');
            const responseMessageFormatted = responseMessageUnformatted
                .replace('{diceroll}', d20Diceroll.toString())
                .replace('{server_size_modifier}', serverSizeModifier.toString())
                .replace('{combined}', (d20Diceroll + serverSizeModifier).toString());
            yield interaction.followUp({
                content: responseMessageFormatted,
                ephemeral: true,
            });
        }), 3000);
        const reward = yield getRewardId(d20Diceroll + serverSizeModifier);
        yield (0, queries_1.addNewClaim)(drop.drop_id, interaction.user.id, reward.friendlyId, 'currency');
        const rewardImage = yield retrieveAwardImage(reward);
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            const randomResponse = getRandomResponse(d20Diceroll, interaction.locale);
            const randomFlavorText = '```css\n[' + `" ${randomResponse} "` + ']\n```';
            const foundSomethingResponseUnformatted = (0, localization_manager_1.getLocalizedText)(interaction.locale, 'command_interactions.roll_command.rolled_found');
            const foundSomethingResponseFormatted = foundSomethingResponseUnformatted
                .replace('{reward_title}', reward.title);
            const responseMessage = `\n ***${randomFlavorText}*** \n ${foundSomethingResponseFormatted} \n `;
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
function getRandomResponse(roll, language) {
    let response;
    if (roll === 1) {
        response = (0, localization_manager_1.getLocalizedText)(language, 'roll_responses.Roll_Nat_1');
    }
    else if (roll >= 2 && roll <= 10) {
        response = (0, localization_manager_1.getLocalizedText)(language, 'roll_responses.Roll_2_10');
    }
    else if (roll >= 11 && roll <= 15) {
        response = (0, localization_manager_1.getLocalizedText)(language, 'roll_responses.Roll_11_15');
    }
    else if (roll >= 16 && roll <= 19) {
        response = (0, localization_manager_1.getLocalizedText)(language, 'roll_responses.Roll_16_19');
    }
    else if (roll === 20) {
        response = (0, localization_manager_1.getLocalizedText)(language, 'roll_responses.Roll_20');
    }
    else {
        return 'Invalid roll!';
    }
    if (response === null) {
        return 'Invalid roll!';
    }
    return response;
}
function retrieveAwardImage(item) {
    return __awaiter(this, void 0, void 0, function* () {
        const imagePath = `./images/${item.friendlyId}.png`;
        console.log('checking if image exists at ' + imagePath);
        if (!fs_1.default.existsSync(`${imagePath}`)) {
            yield downloadImage(item.friendlyId, item.imageUrl);
        }
        const itemImage = yield (0, canvas_1.loadImage)(imagePath);
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
        const imagePath = `./images/result_01.png`;
        console.log('checking if image exists at ' + imagePath);
        const itemImage = yield (0, canvas_1.loadImage)(imagePath);
        const canvas = (0, canvas_1.createCanvas)(200, 200);
        const context = canvas.getContext('2d');
        context.drawImage(itemImage, 0, 0, canvas.width, canvas.height);
        const attachment = new discord_js_1.AttachmentBuilder(yield canvas.encode('png'), {
            name: `result_01.png`,
        });
        return attachment;
    });
}
function downloadImage(itemId, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
        const imagePath = `./images/${itemId}.png`;
        console.log('saving image to ' + imagePath);
        fs_1.default.writeFileSync(imagePath, response.data);
    });
}
module.exports = command;
