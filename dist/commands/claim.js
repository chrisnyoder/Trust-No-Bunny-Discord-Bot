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
exports.handleClaimCommand = void 0;
const queries_1 = require("../database/queries"); // Assuming you have these functions in your queries.ts file.
function handleClaimCommand(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = message.author.id;
        // Check if the user has claimed in the last 24 hours
        const lastClaimDate = yield (0, queries_1.checkLastClaim)(userId);
        if (lastClaimDate && (Date.now() - lastClaimDate.getTime()) < 24 * 60 * 60 * 1000) {
            message.reply("You've already used claim in the last 24 hours.");
            return;
        }
        // Generate a random drop (example for now)
        const items = ['item1', 'item2', 'item3', 'item4'];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        // Add this claim to the database
        yield (0, queries_1.addNewClaim)(userId, randomItem);
        message.reply(`You received: ${randomItem}`);
    });
}
exports.handleClaimCommand = handleClaimCommand;
