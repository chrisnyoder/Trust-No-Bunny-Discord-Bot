import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PLAYFAB_URL_GET_TOKEN = 'https://DDD75.playfabapi.com/Authentication/GetEntityToken';
const PLAYFAB_URL_SEARCH_ITEMS = 'https://DDD75.playfabapi.com/Catalog/SearchItems';
const SECRET_KEY = process.env.PLAYFAB_SECRET_KEY;

async function getEntityToken() {
    console.log(`PlayFab secret key: ${SECRET_KEY}`)
    try {
        const response = await axios.post(PLAYFAB_URL_GET_TOKEN, {}, {
            headers: {
                'X-SecretKey': SECRET_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log(`PlayFab entity token response: ${response.status}`)
        console.log(`PlayFab entity token response: ${response.statusText}`)
        console.log(`PlayFab entity token response: ${response.data}`)
        console.log(`PlayFab entity token: ${response.data.EntityToken}`);
        return response.data.EntityToken;
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

        return response.data; // Modify as per the actual structure of the returned data
    } catch (error) {
        console.error(`Error retrieving PlayFab catalog items: ${error}`);
        throw error;
    }
}
