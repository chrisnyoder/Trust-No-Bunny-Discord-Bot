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
        this.minimumNumberOfMembers = 10;
        this.discordGuild = guild;
        this.defaultChannel = defaultChannel;
    }
    setDefaultChannel(channel) {
        this.defaultChannel = channel;
    }
    activateBot() {
        if (!this.guildHasProcessedDropBefore()) {
            this.handleInitialDrop();
        }
        this.startDropTimer();
        this.sendStartMessage(this.discordGuild);
    }
    deactiveBot() {
        this.stopDropTimer();
    }
    guildAddedMember() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const currentMemberCount = yield this.getMemberCount();
            if (this.dropTimer !== null && currentMemberCount < this.minimumNumberOfMembers) {
                this.stopDropTimer();
            }
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
            return drop !== null;
        });
    }
    startDropTimer() {
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
            const initialDropItem = yield (0, playfab_catalog_1.getInitialDropItem)();
            yield this.updateDropTables(initialDropItem);
            yield this.sendMessageOfDropToGuild(initialDropItem);
        });
    }
    handleRandomDrop() {
        return __awaiter(this, void 0, void 0, function* () {
            var currencyItems = (0, playfab_catalog_1.getCurrencyItems)();
            const randomItem = currencyItems[Math.floor(Math.random() * currencyItems.length)];
            yield this.updateDropTables(randomItem);
            yield this.sendMessageOfDropToGuild(randomItem);
        });
    }
    sendStartMessage(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const responseMessage = `The Trust No Bunny bot is now active in this server! Random drops will now occur in this server. You need at least
        10 members in this server for drops to occur. If you want to change the channel where drops occur, use the ${(0, discord_js_1.inlineCode)(`/channel set <channel>`)} command. To see the current drop
        for this server, use the ${(0, discord_js_1.inlineCode)(`/unclaimed`)} command. To claim the drop, use the
        ${(0, discord_js_1.inlineCode)(`/claim <item>`)} command. To redeem rewards using your currency, go to play.friendlypixel.com`;
            yield this.defaultChannel.send({ content: responseMessage });
        });
    }
    updateDropTables(randomItem) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemId = randomItem.AlternateIds[0].Value;
            const itemType = randomItem.ContentType;
            yield (0, queries_1.insertItemIntoDropTable)(itemId, itemType, this.discordGuild.id);
            yield (0, queries_1.updateLastDropTime)(this.discordGuild.id);
            this.startDropTimer();
        });
    }
    sendMessageOfDropToGuild(randomItem) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve the title and the image URL
            const title = randomItem.Title.NEUTRAL;
            const itemId = randomItem.AlternateIds[0].Value;
            const imageUrl = randomItem.Images[0].Url;
            // Construct the response message
            const claimText = (0, discord_js_1.inlineCode)(`/claim <item>`);
            const responseMessage = `A ${title} just dropped! Use ${claimText} to claim it`;
            yield this.defaultChannel.send({ content: responseMessage, files: [imageUrl] });
            // if (avatarItemTypes.includes(randomItem.ContentType)) {
            //     const attachment = await pasteItemOnBodyImage(itemId, imageUrl);
            //     await firstTextChannel.send({ content: responseMessage, files: [attachment] });
            //     fs.unlinkSync(`./ ${itemId}.png`);
            // } 
        });
    }
}
exports.TNBGuild = TNBGuild;
