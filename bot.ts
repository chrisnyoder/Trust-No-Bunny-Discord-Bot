import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { searchCatalogItems } from './playfabCatalog';
config();
import fs from 'node:fs';
import path from 'node:path';
import { addNewGuild, removeGuild, setGuildStatusToActive, retrieveGuildsFromDB } from './database/queries';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error("Missing BOT_TOKEN in .env file.");
}

const token: string = process.env.BOT_TOKEN as string; 
var listOfGuildIds = new Array<string>();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, CommandData>;
    }
}

type CommandData = {
    data: {
        name: string;
    };
    execute: (interaction: any) => Promise<void>;
};  

client.commands = new Collection<string, CommandData>();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log(`Token: ${BOT_TOKEN}`);

client.once('ready', () => {
    console.log('Bot is online! Fetching active guilds');

    (async () => {
        listOfGuildIds = await retrieveGuildsFromDB();
    })();
});

async function loadCommands() {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command: CommandData = await import(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

loadCommands();

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return; // Check if it's a command interaction

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

async function initialize() {
    try {
        client.login(token); 
        const items = await searchCatalogItems();
        console.log("Successfully fetched items:", JSON.stringify(items));

        // You can add more startup tasks here if needed
    } catch (error) {
        console.error("Error during initialization:", error);
    }
}

client.on('guildCreate', async (guild) => { 
    if (!listOfGuildIds.includes(guild.id))
    { 
        listOfGuildIds.push(guild.id);
        addNewGuild(guild.id);
    } else {
        setGuildStatusToActive(guild.id);
    }
})

client.on('guildDelete', async (guild) => {
    listOfGuildIds = listOfGuildIds.filter(id => id !== guild.id);
    removeGuild(guild.id);
})

initialize();

