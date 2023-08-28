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
const playfab_catalog_1 = require("../playfab/playfab_catalog");
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('unclaimed')
        .setDescription('See the list of unclaimed items in this server'),
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
            const availableDropIds = yield (0, queries_1.retrieveUnclaimedDrops)((_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id);
            var listOfItemNames = [];
            availableDropIds.forEach(el => {
                var itemName = (0, playfab_catalog_1.getNameFromItemId)(el);
                var itemNameFormatted = (0, discord_js_1.inlineCode)(itemName);
                listOfItemNames.push(`${itemNameFormatted}`);
            });
            if (listOfItemNames.length === 0) {
                // Construct the response message
                const responseMessage = `The server currently doesn't have any unclaimed drops`;
                yield interaction.reply({ content: responseMessage });
            }
            else {
                const responseMessage = `Here is the list of unclaimed drops in this server: ${listOfItemNames.toString()}`;
                yield interaction.reply({ content: responseMessage, ephemeral: true });
            }
        });
    }
};
module.exports = command;
