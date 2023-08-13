"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // This will load our .env file
const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;
const commands = [];
const commandsPath = path_1.default.join(__dirname, 'commands'); // Assuming you have a directory named 'commands'
const commandFiles = fs_1.default.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
function loadCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const file of commandFiles) {
            const command = yield Promise.resolve(`${path_1.default.join(commandsPath, file)}`).then(s => __importStar(require(s)));
            if (command.data && command.execute) {
                commands.push(command.data.toJSON());
            }
            else {
                console.log(`[WARNING] The command ${file} is missing a required "data" or "execute" property.`);
            }
        }
    });
}
loadCommands();
const rest = new discord_js_1.REST().setToken(token);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = yield rest.put(discord_js_2.Routes.applicationCommands(clientId), { body: commands });
        console.log(`Successfully reloaded application (/) commands.`);
    }
    catch (error) {
        console.error(error);
    }
}))();
