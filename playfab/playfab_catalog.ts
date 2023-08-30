import axios from 'axios';
import dotenv from 'dotenv';
import { PlayfabItem } from './playfab_item';

dotenv.config();

const PLAYFAB_URL_GET_TOKEN = 'https://DDD75.playfabapi.com/Authentication/GetEntityToken';
const PLAYFAB_URL_SEARCH_ITEMS = 'https://DDD75.playfabapi.com/Catalog/SearchItems';
const SECRET_KEY = process.env.PLAYFAB_SECRET_KEY;
var items: PlayfabItem[] = [];
var currencyDropItems: PlayfabItem[] = [];

async function getEntityToken() {
    console.log(`PlayFab secret key: ${SECRET_KEY}`)
    try {
        const response = await axios.post(PLAYFAB_URL_GET_TOKEN, {}, {
            headers: {
                'X-SecretKey': SECRET_KEY,
                'Content-Type': 'application/json'
            }
        });
        return response.data.data.EntityToken;
    } catch (error) {
        console.error(`Error retrieving PlayFab entity token: ${error}`);
        throw error;
    }
}

export async function searchCatalogItems(): Promise<any> {
    const entityToken = await getEntityToken();

    try {
        const response = await axios.post(PLAYFAB_URL_SEARCH_ITEMS, 
            {
                "Select": "images"
            },
            {
                headers: {
                    'X-EntityToken': entityToken,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Retrieved PlayFab catalog items');

        for (const item of response.data.data.Items) {
            const friendlyId = item.AlternateIds.find((id: { Type: string, Value: string }) => id.Type === "FriendlyId").Value;
            const title = item.Title.NEUTRAL;
            const contentType = item.ContentType;
            const imageUrl = item.Images[0].Url;
            var diceRollRequirement = 0;

            if(item.DisplayProperties.dice_roll_requirement !== undefined) {
                diceRollRequirement = item.DisplayProperties.dice_roll_requirement;
            }

            console.log(`Found item: ${friendlyId} - ${title} - ${contentType} - ${imageUrl} - ${diceRollRequirement}`);

            const playfabItem = new PlayfabItem(friendlyId, title, contentType, imageUrl, diceRollRequirement);
            items.push(playfabItem);
        }
        
        currencyDropItems = items.filter(item => item.type === "currency");
        return response.data; // Modify as per the actual structure of the returned data
    } catch (error) {
        console.error(`Error retrieving PlayFab catalog items: ${error}`);
        throw error;
    }
}

export async function getItems() {
    if (items.length === 0) {
        await searchCatalogItems();
    }

    return items;
}

export async function retrieveBodyImage() {
    if (items.length === 0) {
        await searchCatalogItems();
    }

    const bodyItem = items.find(item => item.friendlyId.toLowerCase() === "body");
    return bodyItem?.imageUrl;
}

export async function getRandomItemBasedOnWeight(serverSize: number): Promise<PlayfabItem> {
    console.log('getting random item based on weight');

    if (items.length === 0) {
        await searchCatalogItems();
    }

    const flatWeightBasedOnServerSize = serverSize * 0.005;
    
    var totalWeight = 0;
    items.forEach(item => totalWeight += (item.diceRollRequirement + flatWeightBasedOnServerSize));

    var randomWeight = Math.random() * totalWeight;
    var chosenItem = items[0];

    for (const item of items) {
        console.log('current item is ' + item.friendlyId + ' with weight ' + (item.diceRollRequirement + flatWeightBasedOnServerSize) + ' and random weight is ' + randomWeight)
        randomWeight -= (item.diceRollRequirement + flatWeightBasedOnServerSize);
        if (randomWeight <= 0) {
            chosenItem = item;
            break;
        }
    }

    return chosenItem;
}
