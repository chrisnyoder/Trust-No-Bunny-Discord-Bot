import { Message } from 'discord.js';
import { checkLastClaim, addNewClaim } from '../database/queries'; // Assuming you have these functions in your queries.ts file.

export async function handleClaimCommand(message: Message): Promise<void> {
    const userId = message.author.id;

    // Check if the user has claimed in the last 24 hours
    const lastClaimDate = await checkLastClaim(userId);

    if (lastClaimDate && (Date.now() - lastClaimDate.getTime()) < 24 * 60 * 60 * 1000) {
        message.reply("You've already used claim in the last 24 hours.");
        return;
    }

    // Generate a random drop (example for now)
    const items = ['item1', 'item2', 'item3', 'item4'];
    const randomItem = items[Math.floor(Math.random() * items.length)];

    // Add this claim to the database
    await addNewClaim(userId, randomItem);

    message.reply(`You received: ${randomItem}`);
}
