import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PLAYFAB_URL_GET_TOKEN = 'https://DDD75.playfabapi.com/Authentication/GetEntityToken';
const PLAYFAB_URL_SEARCH_ITEMS = 'https://DDD75.playfabapi.com/Catalog/SearchItems';
const SECRET_KEY = process.env.PLAYFAB_SECRET_KEY;
var items: any[] = [];
var currencyDropItems: any[] = [];
var itemIds: string[] = [];

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
        
        items = response.data.data.Items;
        currencyDropItems = items.filter(item => item.ContentType === "currency" && item.Title.NEUTRAL !== "100 Silver Karats");
        itemIds = items.map(item => (item.Title.NEUTRAL as string).toLowerCase());
        return response.data; // Modify as per the actual structure of the returned data
    } catch (error) {
        console.error(`Error retrieving PlayFab catalog items: ${error}`);
        throw error;
    }
}

export function getItems() {
    return items;
}

export function getItemIds() { 
    return itemIds;
}

export function getCurrencyItems() { 
    return currencyDropItems;
}

export function getInitialDropItem() {
    return items.find(item => item.Title.NEUTRAL === "100 Silver Karats");
}

export function getItemIdFromName(name: string) { 
     // Find the item that matches the given title
     const item = items.find(item => (item.Title.NEUTRAL as string).toLowerCase() === name);

     // If the item was found, return the FriendlyId. Otherwise, return null.
     return item ? (item.AlternateIds.find((id: { Type: string, Value: string }) => id.Type === "FriendlyId").Value) : null;
}

export function getNameFromItemId(id: string) {
    const item = items.find(item =>
        (item.AlternateIds.find((id: { Type: string, Value: string }) => id.Type === "FriendlyId")
        .Value) === id);
    
    return item ? item.Title.NEUTRAL : null;
}

export function retrieveBodyImage() {
    const bodyItem = items.find(item => item.AlternateIds[0].Value.toLowerCase() === "body");
    return bodyItem.Images[0].Url
}