import { Locale } from "discord.js";
import fs from 'fs';
import path from 'path';
import axios from 'axios';

type LocalizationDict = Record<string, any>;
var localizationData: Record<string, LocalizationDict> = {};
const locales: string[] = ["en-us", "ko", "ja", "zh-cn"];

export function loadLanguages() {
    for (const lang of locales) {
        const filePath = path.join(__dirname, `../../localization/${lang}.json`);
        console.log('reading file from ' + filePath);
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          localizationData[lang] = JSON.parse(fileContent);
        } else {
          console.error(`Language file for ${lang} not found.`);
        }
    }
}

export async function getDefaultLanguage(guildId: string): Promise<string> { 
    try {
        const response = await axios.get(`https://discord.com/api/guilds/${guildId}`, {
            headers: {
                Authorization: 'Bot ' + process.env.BOT_TOKEN
            }
        });
        const region = response.data.region;

        console.log('found guild region ' + region + ' returning default language for that region');

        if (region === "japan") {
            return "ja";
        } else if (region === "south-korea") {
            return "ko";
        } else if (region === "china" || region === "hongkong" || region === "taiwan") {
            return "zh-cn";
        } else {
            return "en-us";
        }
    } catch {
        console.error(`Failed to retrieve guild region for ${guildId}.`);
        return "en-us";
    }
}

export function getLocalizedText(lang: string, key: string): string | null {
    if (!localizationData[lang.toLowerCase()]) {
        console.log(`Localization for language ${lang} does not exist. Using English`);
        lang = 'en-us';
    }
  
    const keys = key.split('.');
    let currentObj = localizationData[lang.toLowerCase()];

    for (const k of keys) {
        if (typeof currentObj === 'object' && currentObj !== null) { 
            currentObj = (currentObj as LocalizationDict)[k];
        } else {
            console.error(`Invalid key ${key} for language ${lang}.`);
            return null;
        }

        if (currentObj === undefined) {
            console.error(`Invalid key ${key} for language ${lang}.`);
            return null;    
        }
    }
  
    if (typeof currentObj === 'string') {
        return currentObj as string;
    }
    else if (Array.isArray(currentObj)) {
        const randomIndex = Math.floor(Math.random() * currentObj.length);
        return currentObj[randomIndex];
    }
    else {
        console.error(`Localized text for ${key} in ${lang} is not a string.`)
        return null;
    }
}