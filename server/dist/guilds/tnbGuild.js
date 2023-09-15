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
const fs_1 = __importDefault(require("fs"));
const localization_manager_1 = require("../localization/localization_manager");
class TNBGuild {
    constructor(guild, defaultChannel, timeSinceLastDrop = null, locale = 'en-us') {
        this.locale = 'en-us';
        this.dropTimer = null;
        this.timeSinceLastDrop = null;
        this.minimumNumberOfMembers = 10;
        this.discordGuild = guild;
        this.defaultChannel = defaultChannel;
        this.timeSinceLastDrop = timeSinceLastDrop;
        this.locale = locale;
    }
    setDefaultChannel(channel) {
        this.defaultChannel = channel;
    }
    setLocale(locale) {
        this.locale = locale;
    }
    activateBot() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentMemberCount = yield this.getMemberCount();
            ///ignores the minimum number of members for the test server
            if (this.dropTimer === null && (currentMemberCount >= this.minimumNumberOfMembers || this.discordGuild.id === '1091035789376360539')) {
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
                    const responseMessageUnformatted = (0, localization_manager_1.getLocalizedText)(this.locale, 'bot_messages.start_message_under_10_members');
                    var responseMessageFormated = responseMessageUnformatted
                        .replace('{roll_command}', (0, discord_js_1.inlineCode)((0, localization_manager_1.getLocalizedText)(this.locale, 'command_interactions.roll_command.name')))
                        .replace('{channel_set_command}', (0, discord_js_1.inlineCode)((0, localization_manager_1.getLocalizedText)(this.locale, 'command_interactions.channel_set_command.name')));
                    yield this.defaultChannel.send({ content: responseMessageFormated });
                }
                catch (_a) {
                    console.log("can't send message to guild, likely as a result of the bot having been uninstalled in the guild");
                }
            }
            else {
                try {
                    const responseMessageUnformatted = (0, localization_manager_1.getLocalizedText)(this.locale, 'bot_messages.start_message_10_members');
                    const responseMessageFormated = responseMessageUnformatted
                        .replace('{roll_command}', (0, discord_js_1.inlineCode)((0, localization_manager_1.getLocalizedText)(this.locale, 'command_interactions.roll_command.name')))
                        .replace('{channel_set_command}', (0, discord_js_1.inlineCode)((0, localization_manager_1.getLocalizedText)(this.locale, 'command_interactions.channel_set_command.name')));
                    yield this.defaultChannel.send({ content: responseMessageFormated });
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
        const testGuildId = '1091035789376360539';
        if (this.discordGuild.id === testGuildId) {
            /// this is the test server... uncomment the code below to make the drop happen every minute in the test server
            console.log('guild is the test server, setting drop timer to 1 minute');
            return 1000 * 60;
        }
        if (this.timeSinceLastDrop !== null) {
            console.log('guild has processed drop before it got interrupted, calculating time until next drop for guild ' + this.discordGuild.id);
            const timeSinceLastDrop = new Date().getTime() - this.timeSinceLastDrop.getTime();
            const timeUntilNextDrop = (Math.floor(Math.random() * (24 * 60 * 60 * 1000)) + 24 * 60 * 60 * 1000) - timeSinceLastDrop;
            console.log(`Processing next drop at ${timeUntilNextDrop}`);
            return timeUntilNextDrop;
        }
        else {
            console.log('Calculating the discord drop timer the normal way ' + this.discordGuild.id);
            const timeUntilNextDrop = Math.floor(Math.random() * (24 * 60 * 60 * 1000)) + 24 * 60 * 60 * 1000;
            console.log(`Processing next drop at ${timeUntilNextDrop}`);
            return timeUntilNextDrop;
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
            const responseMessageUnformatted = (0, localization_manager_1.getLocalizedText)(this.locale, 'bot_messages.caravan_stop');
            const responseMessageFormatted = responseMessageUnformatted.replace('{roll_command}', (0, discord_js_1.inlineCode)((0, localization_manager_1.getLocalizedText)(this.locale, 'command_interactions.roll_command.name')));
            const countCornelioImage = yield this.retrieveImageOfCountCornelio();
            try {
                yield this.defaultChannel.send({ content: responseMessageFormatted, files: [countCornelioImage] });
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
            try {
                const imagePath = './images/Count_Cornelio.png';
                const imageBuffer = fs_1.default.readFileSync(imagePath);
                const countImage = yield (0, canvas_1.loadImage)(imageBuffer);
                const canvas = (0, canvas_1.createCanvas)(256, 256);
                const context = canvas.getContext('2d');
                context.drawImage(countImage, 0, 0, canvas.width, canvas.height);
                const attachment = new discord_js_1.AttachmentBuilder(yield canvas.encode('png'), {
                    name: 'Count_Cornelio.png'
                });
                return attachment;
            }
            catch (_a) {
                console.log('error retrieving image of count cornelio');
                return null;
            }
        });
    }
}
exports.TNBGuild = TNBGuild;
