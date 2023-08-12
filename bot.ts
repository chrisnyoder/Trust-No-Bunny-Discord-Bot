require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();
const PREFIX = '/';

const claimCommand = require('./commands/claim');

bot.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const [command, ...args] = message.content.trim().substring(PREFIX.length).split(/\s+/);

    if (command === "claim") {
        claimCommand.handle(message);
    }
    // ... other commands
});

bot.login(process.env.DISCORD_TOKEN);
