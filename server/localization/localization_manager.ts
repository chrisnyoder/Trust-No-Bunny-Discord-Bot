import { Locale } from "discord.js";
import fs from 'fs';
import path from 'path';

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

export function getLocalizedText(lang: string, key: string): string | null {
    if (!localizationData[lang]) {
        console.error(`Localization for language ${lang} not loaded.`);
        return null;
    }
  
    const keys = key.split('.');
    let currentObj = localizationData[lang];

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
  
    console.log(`Found localized text for ${key} in ${lang}. Returning ${currentObj.toString()}}`);
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