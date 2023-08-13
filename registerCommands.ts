import { REST } from 'discord.js';
import { Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config(); // This will load our .env file

const clientId = process.env.CLIENT_ID as string;
const token = process.env.BOT_TOKEN as string;

const commands: any[] = [];
const commandsPath = path.join(__dirname, 'commands'); 
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

async function loadCommands() { 
    console.log(`Loading command files from path ${commandsPath}..`);

    for (const file of commandFiles) {
        const command = await import(path.join(commandsPath, file));
    
        if (command.data && command.execute) {
            console.log(`Loading command ` + command.data.name + `..`);
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command ${file} is missing a required "data" or "execute" property.`);
        }
    }
}


const rest = new REST().setToken(token);

(async () => {
    await loadCommands();

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
