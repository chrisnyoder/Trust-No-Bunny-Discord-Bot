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
const queries_1 = require("../database/queries");
const discord_js_1 = require("discord.js");
const playfabCatalog_1 = require("../playfabCatalog");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim your reward!'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = (0, playfabCatalog_1.getItems)();
            const randomItem = items[Math.floor(Math.random() * items.length)];
            yield (0, queries_1.addNewClaim)(interaction.user.id, randomItem.Title.NEUTRAL);
            console.log('Claim successful for ' + interaction.user.id + ' with item ' + randomItem + '.');
            // Retrieve the title and the image URL
            const title = randomItem.Title.NEUTRAL;
            const imageUrl = randomItem.Images[0].Url;
            // Construct the response message
            const responseMessage = `You earned a ${title}`;
            yield interaction.reply({ content: responseMessage, files: [imageUrl] });
        });
    }
};
module.exports = command;
