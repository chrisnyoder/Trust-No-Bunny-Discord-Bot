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
exports.getRandomItemBasedOnWeight = exports.retrieveBodyImage = exports.getItems = exports.searchCatalogItems = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const playfab_item_1 = require("./playfab_item");
dotenv_1.default.config();
const PLAYFAB_URL_GET_TOKEN = 'https://DDD75.playfabapi.com/Authentication/GetEntityToken';
const PLAYFAB_URL_SEARCH_ITEMS = 'https://DDD75.playfabapi.com/Catalog/SearchItems';
const SECRET_KEY = process.env.PLAYFAB_SECRET_KEY;
var items = [];
var currencyDropItems = [];
function getEntityToken() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`PlayFab secret key: ${SECRET_KEY}`);
        try {
            const response = yield axios_1.default.post(PLAYFAB_URL_GET_TOKEN, {}, {
                headers: {
                    'X-SecretKey': SECRET_KEY,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data.EntityToken;
        }
        catch (error) {
            console.error(`Error retrieving PlayFab entity token: ${error}`);
            throw error;
        }
    });
}
function searchCatalogItems() {
    return __awaiter(this, void 0, void 0, function* () {
        const entityToken = yield getEntityToken();
        try {
            const response = yield axios_1.default.post(PLAYFAB_URL_SEARCH_ITEMS, {
                "Select": "images"
            }, {
                headers: {
                    'X-EntityToken': entityToken,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Retrieved PlayFab catalog items');
            for (const item of response.data.data.Items) {
                const friendlyId = item.AlternateIds.find((id) => id.Type === "FriendlyId").Value;
                const title = item.Title.NEUTRAL;
                const contentType = item.ContentType;
                const imageUrl = item.Images[0].Url;
                var diceRollRequirement = 0;
                if (item.DisplayProperties.dice_roll_requirement !== undefined) {
                    diceRollRequirement = item.DisplayProperties.dice_roll_requirement;
                }
                console.log(`Found item: ${friendlyId} - ${title} - ${contentType} - ${imageUrl} - ${diceRollRequirement}`);
                const playfabItem = new playfab_item_1.PlayfabItem(friendlyId, title, contentType, imageUrl, diceRollRequirement);
                items.push(playfabItem);
            }
            currencyDropItems = items.filter(item => item.type === "currency");
            return response.data; // Modify as per the actual structure of the returned data
        }
        catch (error) {
            console.error(`Error retrieving PlayFab catalog items: ${error}`);
            throw error;
        }
    });
}
exports.searchCatalogItems = searchCatalogItems;
function getItems() {
    return __awaiter(this, void 0, void 0, function* () {
        if (items.length === 0) {
            yield searchCatalogItems();
        }
        return items;
    });
}
exports.getItems = getItems;
function retrieveBodyImage() {
    return __awaiter(this, void 0, void 0, function* () {
        if (items.length === 0) {
            yield searchCatalogItems();
        }
        const bodyItem = items.find(item => item.friendlyId.toLowerCase() === "body");
        return bodyItem === null || bodyItem === void 0 ? void 0 : bodyItem.imageUrl;
    });
}
exports.retrieveBodyImage = retrieveBodyImage;
function getRandomItemBasedOnWeight(serverSize) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('getting random item based on weight');
        if (items.length === 0) {
            yield searchCatalogItems();
        }
        const flatWeightBasedOnServerSize = serverSize * 0.005;
        var totalWeight = 0;
        items.forEach(item => totalWeight += (item.diceRollRequirement + flatWeightBasedOnServerSize));
        var randomWeight = Math.random() * totalWeight;
        var chosenItem = items[0];
        for (const item of items) {
            console.log('current item is ' + item.friendlyId + ' with weight ' + (item.diceRollRequirement + flatWeightBasedOnServerSize) + ' and random weight is ' + randomWeight);
            randomWeight -= (item.diceRollRequirement + flatWeightBasedOnServerSize);
            if (randomWeight <= 0) {
                chosenItem = item;
                break;
            }
        }
        return chosenItem;
    });
}
exports.getRandomItemBasedOnWeight = getRandomItemBasedOnWeight;
