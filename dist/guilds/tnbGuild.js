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
exports.TNBGuild = void 0;
const discord_js_1 = require("discord.js");
const queries_1 = require("../database/queries");
const playfab_catalog_1 = require("../playfab/playfab_catalog");
class TNBGuild {
    constructor(guild, defaultChannel) {
        this.dropTimer = null;
        this.minimumNumberOfMembers = 1;
        this.discordGuild = guild;
        this.defaultChannel = defaultChannel;
    }
    setDefaultChannel(channel) {
        this.defaultChannel = channel;
    }
    activateBot() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('activating bot for guild ' + this.discordGuild.id);
            if ((yield this.guildHasProcessedDropBefore()) === false) {
                this.handleInitialDrop();
            }
            this.startDropTimer();
        });
    }
    deactiveBot() {
        this.stopDropTimer();
    }
    guildAddedMember() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('guild added a member');
            const currentMemberCount = yield this.getMemberCount();
            if (this.dropTimer === null && currentMemberCount >= this.minimumNumberOfMembers) {
                this.startDropTimer();
                if (!this.guildHasProcessedDropBefore()) {
                    this.handleInitialDrop();
                }
            }
        });
    }
    guildRemovedMember() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('guild removed a member');
            const currentMemberCount = yield this.getMemberCount();
            if (this.dropTimer !== null && currentMemberCount < this.minimumNumberOfMembers) {
                this.stopDropTimer();
            }
        });
    }
    sendStartMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const responseMessage = `The Trust No Bunny bot is now active in this server! Random drops will now occur in this server. To claim the current drop, use the ${(0, discord_js_1.inlineCode)(`/claim <item>`)} command. To redeem rewards using your currency, go to play.friendlypixel.com`;
            yield this.defaultChannel.send({ content: responseMessage });
        });
    }
    getMemberCount() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.discordGuild.members.fetch();
            var numberOfGuildMembers = this.discordGuild.members.cache.filter(member => !member.user.bot).size;
            return numberOfGuildMembers;
        });
    }
    guildHasProcessedDropBefore() {
        return __awaiter(this, void 0, void 0, function* () {
            const drop = yield (0, queries_1.getDropFromGuild)(this.discordGuild.id);
            console.log('guild has processed drop before: ' + (drop !== null));
            return drop !== null;
        });
    }
    startDropTimer() {
        console.log('starting drop timer for guild ' + this.discordGuild.id);
        this.dropTimer = setTimeout(() => {
            this.handleRandomDrop();
        }, this.getRandomDuration());
    }
    stopDropTimer() {
        if (this.dropTimer !== null) {
            clearTimeout(this.dropTimer);
        }
    }
    getRandomDuration() {
        // Generate a random time between 12 and 24 hours in milliseconds
        return Math.floor(Math.random() * (12 * 60 * 60 * 1000)) + (12 * 60 * 60 * 1000);
    }
    handleInitialDrop() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('handling initial drop for guild ' + this.discordGuild.id);
            const initialDropItem = yield (0, playfab_catalog_1.getInitialDropItem)();
            yield this.updateDropTables(initialDropItem);
            yield this.sendMessageOfDropToGuild(initialDropItem);
        });
    }
    handleRandomDrop() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('handling random drop for guild ' + this.discordGuild.id);
            var currencyItems = (0, playfab_catalog_1.getCurrencyItems)();
            const randomItem = currencyItems[Math.floor(Math.random() * currencyItems.length)];
            yield this.updateDropTables(randomItem);
            yield this.sendMessageOfDropToGuild(randomItem);
        });
    }
    updateDropTables(itemToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('updating drop tables for guild ' + this.discordGuild.id);
            yield (0, queries_1.insertItemIntoDropTable)(itemToUpdate.friendlyId, itemToUpdate.type, this.discordGuild.id);
            yield (0, queries_1.updateLastDropTime)(this.discordGuild.id);
            this.startDropTimer();
        });
    }
    sendMessageOfDropToGuild(itemToDrop) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('sending message of drop to guild ' + this.discordGuild.id);
            // Retrieve the title and the image URL
            // Construct the response message
            const claimText = (0, discord_js_1.inlineCode)(`/claim <item>`);
            const responseMessage = `A ${itemToDrop.title} just dropped! Use ${claimText} to claim it`;
            yield this.defaultChannel.send({ content: responseMessage, files: [itemToDrop.imageUrl] });
            // if (avatarItemTypes.includes(randomItem.ContentType)) {
            //     const attachment = await pasteItemOnBodyImage(itemId, imageUrl);
            //     await firstTextChannel.send({ content: responseMessage, files: [attachment] });
            //     fs.unlinkSync(`./ ${itemId}.png`);
            // } 
        });
    }
}
exports.TNBGuild = TNBGuild;
