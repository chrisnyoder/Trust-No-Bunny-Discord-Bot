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
exports.addNewClaim = exports.checkLastClaim = void 0;
const promise_1 = __importDefault(require("mysql2/promise")); // Using mysql2 for promise-based interaction.
// This assumes you have a connection configuration set up somewhere.
const config_1 = require("../config");
// Check the last claim date for a user.
function checkLastClaim(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            const [rows] = yield connection.execute('SELECT `timestamp` FROM `claims` WHERE `user_id` = ? ORDER BY `timestamp` DESC LIMIT 1', [userId]);
            if (rows.length === 0) {
                return null;
            }
            return new Date(rows[0].timestamp);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.checkLastClaim = checkLastClaim;
// Add a new claim to the database for a user.
function addNewClaim(userId, dropItem) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection(config_1.dbConfig);
        try {
            yield connection.execute('INSERT INTO `claims` (`user_id`, `drop_name`, `has_been_claimed`) VALUES (?, ?, false)', [userId, dropItem]);
        }
        finally {
            yield connection.end();
        }
    });
}
exports.addNewClaim = addNewClaim;
