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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TNBGuild = void 0;
const discord_js_1 = require("discord.js");
const queries_1 = require("../database/queries");
const canvas_1 = require("@napi-rs/canvas");
const path_1 = __importDefault(require("path"));
class TNBGuild {
    constructor(guild, defaultChannel, timeSinceLastDrop = null) {
        this.dropTimer = null;
        this.timeSinceLastDrop = null;
        this.minimumNumberOfMembers = 10;
        this.discordGuild = guild;
        this.defaultChannel = defaultChannel;
        this.timeSinceLastDrop = timeSinceLastDrop;
    }
    setDefaultChannel(channel) {
        this.defaultChannel = channel;
    }
    activateBot() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentMemberCount = yield this.getMemberCount();
            ///ignores the minimum number of members for the test server
            if (currentMemberCount >= this.minimumNumberOfMembers || this.discordGuild.id === '1091035789376360539') {
                console.log('activating bot for guild ' + this.discordGuild.id);
                if ((yield this.guildHasProcessedDropBefore()) === false) {
                    this.handleInitialDrop();
                }
                this.startDropTimer();
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
            const numberOfGuildMembers = yield this.getMemberCount();
            if (numberOfGuildMembers < this.minimumNumberOfMembers) {
                try {
                    const responseMessage = `The Trust No Bunny bot is now active in this server! Count Cornelio’s caravan will make stops here once the server has reached at least 10 members. To claim the current drop, use the ${(0, discord_js_1.inlineCode)(`/roll`)} command. Use ${(0, discord_js_1.inlineCode)(`/channel set`)} to set which channel the caravn will stop in. To redeem rewards using your ill-gotten gains, go to play.friendlypixel.com`;
                    yield this.defaultChannel.send({ content: responseMessage });
                }
                catch (_a) {
                    console.log("can't send message to guild, likely as a result of the bot having been uninstalled in the guild");
                }
            }
            else {
                try {
                    const responseMessage = `The Trust No Bunny bot is now active in this server! Count Cornelio’s caravan will make occasionally make stops in this server. When his caravan stops by, use the ${(0, discord_js_1.inlineCode)(`/roll`)} command to raid his caravan. Use ${(0, discord_js_1.inlineCode)(`/channel set`)} to set which channel the caravn will stop in. To redeem rewards using your ill-gotten gains, go to play.friendlypixel.com`;
                    yield this.defaultChannel.send({ content: responseMessage });
                }
                catch (_b) {
                    console.log("can't send message to guild, likely as a result of the bot having been uninstalled in the guild");
                }
            }
        });
    }
    getMemberCount() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Getting member count...');
            try {
                console.log('fetching members');
                yield this.discordGuild.members.fetch();
                return this.discordGuild.members.cache.filter((member) => !member.user.bot).size;
            }
            catch (_a) {
                console.log('error fetching members, using the cached member count');
                return this.discordGuild.members.cache.filter((member) => !member.user.bot).size;
            }
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
            this.handleDrop();
        }, this.getRandomDuration());
    }
    stopDropTimer() {
        if (this.dropTimer !== null) {
            clearTimeout(this.dropTimer);
        }
    }
    getRandomDuration() {
        console.log(this.discordGuild.id + ' is the guild id. Has length of ' + this.discordGuild.id.length);
        const testGuildId = '1091035789376360539';
        console.log('test guild id is ' + testGuildId + ' and has length of ' + testGuildId.length);
        if (this.discordGuild.id === testGuildId) {
            /// this is the test server... uncomment the code below to make the drop happen every minute in the test server
            console.log('guild is the test server, setting drop timer to 1 minute');
            return 1000 * 60;
        }
        if (this.timeSinceLastDrop !== null) {
            console.log('guild has processed drop before it got interrupted, calculating time until next drop for guild ' + this.discordGuild.id);
            const timeSinceLastDrop = new Date().getTime() - this.timeSinceLastDrop.getTime();
            const timeUntilNextDrop = (Math.floor(Math.random() * (24 * 60 * 60 * 1000)) + 24 * 60 * 60 * 1000) - timeSinceLastDrop;
            return timeUntilNextDrop;
        }
        else {
            console.log('Calculating the discord drop timer the normal way ' + this.discordGuild.id);
            return Math.floor(Math.random() * (24 * 60 * 60 * 1000)) + 24 * 60 * 60 * 1000;
        }
    }
    handleInitialDrop() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('handling initial drop for guild ' + this.discordGuild.id);
            setTimeout(() => {
                this.handleDrop();
            }, 1000 * 30);
        });
    }
    handleDrop() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('handling random drop for guild ' + this.discordGuild.id);
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
            // Construct the response message
            const rollText = (0, discord_js_1.inlineCode)(`/roll`);
            const responseMessage = `The nefarious Count Cornelio’s caravan is stopping in town for the night. Dare you help yourself to some of his ill gotten gains? ! Use ${rollText} to infilrate and look for treasure!`;
            const unknownSkImage = yield this.retrieveImageOfCountCornelio();
            try {
                yield this.defaultChannel.send({ content: responseMessage, files: [unknownSkImage] });
                this.timeSinceLastDrop = new Date();
                this.startDropTimer();
            }
            catch (_a) {
                console.log("can't send message to guild, likely as a result of the bot having been uninstalled in the guild");
            }
        });
    }
    retrieveImageOfCountCornelio() {
        return __awaiter(this, void 0, void 0, function* () {
            const imagePath = path_1.default.join(__dirname, '../images/Count_Cornelio.png');
            const countImage = yield (0, canvas_1.loadImage)(imagePath);
            const canvas = (0, canvas_1.createCanvas)(256, 256);
            const context = canvas.getContext('2d');
            context.drawImage(countImage, 0, 0, canvas.width, canvas.height);
            const attachment = new discord_js_1.AttachmentBuilder(yield canvas.encode('png'), {
                name: 'avatar-image.png',
            });
            return attachment;
        });
    }
}
exports.TNBGuild = TNBGuild;
