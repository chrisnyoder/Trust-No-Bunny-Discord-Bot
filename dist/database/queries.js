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
exports.retrieveUnclaimedDrops = exports.updateLastDropTime = exports.insertItemIntoDropTable = exports.setDefaultChannelForGuild = exports.retrieveGuildsFromDB = exports.setGuildStatusToActive = exports.removeGuild = exports.addNewGuild = exports.addNewClaim = exports.setDropAsClaimed = exports.checkWhetherPlayerHasClaimedDrop = exports.getDropFromGuild = void 0;
const promise_1 = __importDefault(require("mysql2/promise")); // Using mysql2 for promise-based interaction.
// This assumes you have a connection configuration set up somewhere.
const config_1 = require("../config");
const tnbGuild_1 = require("../guilds/tnbGuild");
// Check the last claim date for a user.
function getDropFromGuild(guildId) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            const query = yield connection.execute('SELECT * FROM `tnb_drops` WHERE `guild_id` = ? ORDER BY drop_time DESC LIMIT 1', [guildId]);
            /// Cast query to drop type 
            if (query.length === 0)
                return null;
            const drop = query[0];
            return drop;
        }
        finally {
            yield connection.end();
        }
    });
}
exports.getDropFromGuild = getDropFromGuild;
function checkWhetherPlayerHasClaimedDrop(dropId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            const [rows] = yield connection.execute('SELECT * FROM `tnb_claims` WHERE `drop_id` = ? AND `player_id` = ?', [dropId, userId]);
            return rows.length > 0;
        }
        finally {
            yield connection.end();
        }
    });
}
exports.checkWhetherPlayerHasClaimedDrop = checkWhetherPlayerHasClaimedDrop;
function setDropAsClaimed(dropId) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            yield connection.execute('UPDATE `tnb_drops` SET `has_been_claimed` = true WHERE `drop_id` = ?', [dropId]);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.setDropAsClaimed = setDropAsClaimed;
// Add a new claim to the database for a user.
function addNewClaim(dropId, userId, rewardId, rewardType) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            yield connection.execute('INSERT INTO `tnb_claims` (`drop_id`, `player_id`, `reward_id`, `reward_type`) VALUES (?, ?, ?, ?)', [dropId, userId, rewardId, rewardType]);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.addNewClaim = addNewClaim;
function addNewGuild(guildId, memberCount) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        console.log('adding new guild' + guildId + ' to db');
        try {
            yield connection.execute('INSERT INTO `tnb_discord_guilds` (`guild_id`, `is_active`, `member_count`, `time_since_last_drop`)  VALUES (?, true, ?, null)', [guildId, memberCount]);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.addNewGuild = addNewGuild;
function removeGuild(guildId) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            yield connection.execute('UPDATE `tnb_discord_guilds` SET `is_active` = 0 WHERE `guild_id` = ?', [guildId]);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.removeGuild = removeGuild;
function setGuildStatusToActive(guildId) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            yield connection.execute('UPDATE `tnb_discord_guilds` SET `is_active` = 1 WHERE `guild_id` = ?', [guildId]);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.setGuildStatusToActive = setGuildStatusToActive;
function retrieveGuildsFromDB(guildManager) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            const [rows] = yield connection.execute('SELECT `guild_id`, `channel_id_for_drops` FROM `tnb_discord_guilds` WHERE `is_active` = 1');
            const guilds = rows.map(row => {
                const guild = guildManager.cache.get(row.guild_id);
                const guildChannel = guild.channels.cache.get(row.channel_id_for_drops);
                return new tnbGuild_1.TNBGuild(guild, guildChannel);
            });
            return guilds;
        }
        finally {
            yield connection.end();
        }
    });
}
exports.retrieveGuildsFromDB = retrieveGuildsFromDB;
function setDefaultChannelForGuild(guildId, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            yield connection.execute('UPDATE `tnb_discord_guilds` SET `channel_id_for_drops` = ? WHERE `guild_id` = ?', [channelId, guildId]);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.setDefaultChannelForGuild = setDefaultChannelForGuild;
function insertItemIntoDropTable(itemId, itemType, guildId) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            yield connection.execute('INSERT INTO `tnb_drops` (`guild_id`, `reward_id`, `reward_type`)  VALUES (?, ?, ?)', [guildId, itemId, itemType]);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.insertItemIntoDropTable = insertItemIntoDropTable;
function updateLastDropTime(guildId) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            yield connection.execute('UPDATE `tnb_discord_guilds` SET `time_since_last_drop` = NOW() WHERE `guild_id` = ?', [guildId]);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.updateLastDropTime = updateLastDropTime;
function retrieveUnclaimedDrops(guildId) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            const [rows] = yield connection.execute('SELECT DISTINCT `reward_id` FROM `tnb_drops` WHERE `guild_id` = ? AND `has_been_claimed` = false', [guildId]);
            return rows.map(row => row.reward_id);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.retrieveUnclaimedDrops = retrieveUnclaimedDrops;
