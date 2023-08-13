import { Client, GatewayIntentBits, Message } from 'discord.js';
import dotenv from 'dotenv';
import { handleClaimCommand } from './commands/claim'; // You might need to create a handleClaimCommand function in claim.ts

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error("Missing BOT_TOKEN in .env file.");
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;

    // Assuming commands start with '/'
    if (message.content.startsWith('/')) {
        const command: string = message.content.split(' ')[0].slice(1); // remove the slash
        switch (command) {
            case 'claim':
                handleClaimCommand(message);
                break;
            // you can add other command handlers here
        }
    }
});

client.login(BOT_TOKEN);
