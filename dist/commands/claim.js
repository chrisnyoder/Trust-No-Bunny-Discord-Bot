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
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandData = void 0;
const discord_js_1 = require("discord.js");
exports.commandData = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim your reward!'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = ['item1', 'item2', 'item3', 'item4'];
            const randomItem = items[Math.floor(Math.random() * items.length)];
            // await addNewClaim(interaction.user.id, randomItem);
            console.log('Claim successful for ' + interaction.user.id + ' with item ' + randomItem + '.');
            yield interaction.reply('Claim successful! You earned ' + randomItem);
        });
    }
};
