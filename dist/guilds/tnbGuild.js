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
const canvas_1 = require("@napi-rs/canvas");
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
            const currentMemberCount = yield this.getMemberCount();
            if (currentMemberCount >= this.minimumNumberOfMembers) {
                console.log('activating bot for guild ' + this.discordGuild.id);
                if ((yield this.guildHasProcessedDropBefore()) === false) {
                    this.handleInitialDrop();
                }
                this.startDropTimer(currentMemberCount);
            }
            else {
                console.log('not activating bot for guild ' + this.discordGuild.id + ' because it does not have enough members');
            }
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
                this.startDropTimer(currentMemberCount);
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
            const numberOfGuildMembers = yield this.getMemberCount();
            if (numberOfGuildMembers < this.minimumNumberOfMembers) {
                const responseMessage = `The Trust No Bunny bot is now active in this server! Drops will start occuring once it has reached at least 10 members. To claim the current drop, use the ${(0, discord_js_1.inlineCode)(`/roll`)} command. To redeem rewards using your currency, go to play.friendlypixel.com`;
                yield this.defaultChannel.send({ content: responseMessage });
            }
            else {
                const responseMessage = `The Trust No Bunny bot is now active in this server! Drops will start ocurring in this server. To claim the current drop, use the ${(0, discord_js_1.inlineCode)(`/roll`)} command. To redeem rewards using your currency, go to play.friendlypixel.com`;
                yield this.defaultChannel.send({ content: responseMessage });
            }
        });
    }
    getMemberCount() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Getting member count...');
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
    startDropTimer(serverSize) {
        console.log('starting drop timer for guild ' + this.discordGuild.id);
        this.dropTimer = setTimeout(() => {
            this.handleRandomDrop(serverSize);
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
            setTimeout(() => {
                this.updateDropTables();
                this.sendMessageOfInitialDroptToGuild(initialDropItem);
            }, 1000 * 30);
        });
    }
    handleRandomDrop(serverSize) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('handling random drop for guild ' + this.discordGuild.id);
            ;
            yield this.updateDropTables();
            yield this.sendMessageOfDropToGuild();
        });
    }
    updateDropTables() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('updating drop tables for guild ' + this.discordGuild.id);
            yield (0, queries_1.insertItemIntoDropTable)(this.discordGuild.id);
            yield (0, queries_1.updateLastDropTime)(this.discordGuild.id);
        });
    }
    sendMessageOfDropToGuild() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('sending message of drop to guild ' + this.discordGuild.id);
            // Retrieve the title and the image URL
            // Construct the response message
            const rollText = (0, discord_js_1.inlineCode)(`/roll`);
            const responseMessage = `A reward just dropped! Use ${rollText} to claim it`;
            const unknownSkImage = yield this.retrieveUnkownSkImage();
            yield this.defaultChannel.send({ content: responseMessage, files: [unknownSkImage] });
            this.startDropTimer(yield this.getMemberCount());
            // if (avatarItemTypes.includes(randomItem.ContentType)) {
            //     const attachment = await pasteItemOnBodyImage(itemId, imageUrl);
            //     await firstTextChannel.send({ content: responseMessage, files: [attachment] });
            //     fs.unlinkSync(`./ ${itemId}.png`);
            // } 
        });
    }
    sendMessageOfInitialDroptToGuild(itemToDrop) {
        return __awaiter(this, void 0, void 0, function* () {
            const claimText = (0, discord_js_1.inlineCode)(`/roll`);
            const responseMessage = `Here's ${itemToDrop.title} to get you started! Use ${claimText} to claim it. Use them at play.friendlypixel.com`;
            yield this.defaultChannel.send({ content: responseMessage, files: [itemToDrop.imageUrl] });
        });
    }
    retrieveUnkownSkImage() {
        return __awaiter(this, void 0, void 0, function* () {
            const unknownSkImage = yield (0, canvas_1.loadImage)('./unknown_sk.png');
            const canvas = (0, canvas_1.createCanvas)(500, 500);
            const context = canvas.getContext('2d');
            context.drawImage(unknownSkImage, 0, 0, canvas.width, canvas.height);
            const attachment = new discord_js_1.AttachmentBuilder(yield canvas.encode('png'), { name: 'avatar-image.png' });
            return attachment;
        });
    }
}
exports.TNBGuild = TNBGuild;
