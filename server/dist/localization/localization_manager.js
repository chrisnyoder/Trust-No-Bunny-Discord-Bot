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
exports.getLocalizedText = exports.getDefaultLanguage = exports.loadLanguages = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
var localizationData = {};
const locales = ["en-us", "ko", "ja", "zh-cn"];
function loadLanguages() {
    for (const lang of locales) {
        const filePath = path_1.default.join(__dirname, `../../localization/${lang}.json`);
        console.log('reading file from ' + filePath);
        if (fs_1.default.existsSync(filePath)) {
            const fileContent = fs_1.default.readFileSync(filePath, 'utf8');
            localizationData[lang] = JSON.parse(fileContent);
        }
        else {
            console.error(`Language file for ${lang} not found.`);
        }
    }
}
exports.loadLanguages = loadLanguages;
function getDefaultLanguage(guildId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://discord.com/api/guilds/${guildId}`, {
                headers: {
                    Authorization: 'Bot ' + process.env.BOT_TOKEN
                }
            });
            const region = response.data.region;
            console.log('found guild region ' + region + ' returning default language for that region');
            if (region === "japan") {
                return "ja";
            }
            else if (region === "south-korea") {
                return "ko";
            }
            else if (region === "china" || region === "hongkong" || region === "taiwan") {
                return "zh-cn";
            }
            else {
                return "en-us";
            }
        }
        catch (_a) {
            console.error(`Failed to retrieve guild region for ${guildId}.`);
            return "en-us";
        }
    });
}
exports.getDefaultLanguage = getDefaultLanguage;
function getLocalizedText(lang, key) {
    if (!localizationData[lang.toLowerCase()]) {
        console.error(`Localization for language ${lang} not loaded.`);
        return null;
    }
    const keys = key.split('.');
    let currentObj = localizationData[lang.toLowerCase()];
    for (const k of keys) {
        if (typeof currentObj === 'object' && currentObj !== null) {
            currentObj = currentObj[k];
        }
        else {
            console.error(`Invalid key ${key} for language ${lang}.`);
            return null;
        }
        if (currentObj === undefined) {
            console.error(`Invalid key ${key} for language ${lang}.`);
            return null;
        }
    }
    console.log(`Found localized text for ${key} in ${lang}. Returning ${currentObj.toString()}}`);
    if (typeof currentObj === 'string') {
        return currentObj;
    }
    else if (Array.isArray(currentObj)) {
        const randomIndex = Math.floor(Math.random() * currentObj.length);
        return currentObj[randomIndex];
    }
    else {
        console.error(`Localized text for ${key} in ${lang} is not a string.`);
        return null;
    }
}
exports.getLocalizedText = getLocalizedText;
