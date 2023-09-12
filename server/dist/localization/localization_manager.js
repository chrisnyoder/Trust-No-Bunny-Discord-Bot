"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalizedText = exports.loadLanguages = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var currentLanguage = discord_js_1.Locale.EnglishUS;
var localizationData = {};
const locales = ["en-us", "ko", "ja", "zh-cn"];
function loadLanguages() {
    for (const lang in locales) {
        const filePath = path_1.default.join(__dirname, `${lang.toLowerCase()}.json`);
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
function getLocalizedText(lang, key) {
    if (!localizationData[lang]) {
        console.error(`Localization for language ${lang} not loaded.`);
        return null;
    }
    const keys = key.split('.');
    let currentObj = localizationData[lang];
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
