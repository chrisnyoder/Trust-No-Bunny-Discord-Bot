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
            var baseProbabilityOfDrop = 0;

            if(item.DisplayProperties.base_drop_probability !== undefined) {
                baseProbabilityOfDrop = item.DisplayProperties.base_drop_probability;
            }

            console.log(`Found item: ${friendlyId} - ${title} - ${contentType} - ${imageUrl} - ${baseProbabilityOfDrop}`);

            const playfabItem = new PlayfabItem(friendlyId, title, contentType, imageUrl, baseProbabilityOfDrop);
            items.push(playfabItem);
        }
        
        currencyDropItems = items.filter(item => item.type === "currency");
        return response.data; // Modify as per the actual structure of the returned data
    } catch (error) {
        console.error(`Error retrieving PlayFab catalog items: ${error}`);
        throw error;
    }
}

export function getItems() {
    return items;
}

export async function getCurrencyItems() { 
    if (currencyDropItems.length === 0) { 
        await searchCatalogItems();
    }

    return currencyDropItems;
}

export async function getInitialDropItem(): Promise<PlayfabItem> {
    if (items.length === 0) {
        await searchCatalogItems();
    }

    var initialDropItem = items.find(item => item.title === "100 Silver Karats") as PlayfabItem;
    return initialDropItem
}

export async function retrieveBodyImage() {
    if (items.length === 0) {
        await searchCatalogItems();
    }

    const bodyItem = items.find(item => item.friendlyId.toLowerCase() === "body");
    return bodyItem?.imageUrl;
}
