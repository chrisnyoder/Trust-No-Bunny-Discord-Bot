import { Guild, TextChannel, inlineCode } from 'discord.js';
import { getDropFromGuild, insertItemIntoDropTable, updateLastDropTime } from '../database/queries';
import { getItems, getCurrencyItems, getInitialDropItem } from '../playfab/playfab_catalog';
import { PlayfabItem } from '../playfab/playfab_item';

export class TNBGuild {
    
    discordGuild: Guild;
    defaultChannel: TextChannel;
    dropTimer: NodeJS.Timeout | null = null;
    minimumNumberOfMembers = 1;

    constructor(guild: Guild, defaultChannel: TextChannel) {
        this.discordGuild = guild;
        this.defaultChannel = defaultChannel;
    }

    setDefaultChannel(channel: TextChannel) {
        this.defaultChannel = channel;
    }

    async activateBot() { 

        const currentMemberCount = await this.getMemberCount();

        if (currentMemberCount >= this.minimumNumberOfMembers) {
            console.log('activating bot for guild ' + this.discordGuild.id);
            if (await this.guildHasProcessedDropBefore() === false) {
                this.handleInitialDrop();
            }
            this.startDropTimer();
        } else {
            console.log('not activating bot for guild ' + this.discordGuild.id + ' because it does not have enough members');
        }
    }

    deactiveBot() {
        this.stopDropTimer();
    }

    async guildAddedMember() {
        console.log('guild added a member');
        const currentMemberCount = await this.getMemberCount();
        if(this.dropTimer === null && currentMemberCount >= this.minimumNumberOfMembers) {
            this.startDropTimer();

            if (!this.guildHasProcessedDropBefore()) {
                this.handleInitialDrop();
            }
        }
    }

    async guildRemovedMember() {
        console.log('guild removed a member');
        const currentMemberCount = await this.getMemberCount();
        if(this.dropTimer !== null && currentMemberCount < this.minimumNumberOfMembers) {
            this.stopDropTimer();
        }
    }

    async sendStartMessage() {
        const numberOfGuildMembers = await this.getMemberCount();

        if (numberOfGuildMembers < this.minimumNumberOfMembers) {
            const responseMessage = `The Trust No Bunny bot is now active in this server! Drops will start occuring once it has reached at least 10 members. To claim the current drop, use the ${inlineCode(`/claim <item>`)} command. To redeem rewards using your currency, go to play.friendlypixel.com`;
            await this.defaultChannel.send({ content: responseMessage });
        } else {
            const responseMessage = `The Trust No Bunny bot is now active in this server! Drops will start ocurring in this server. To claim the current drop, use the ${inlineCode(`/claim <item>`)} command. To redeem rewards using your currency, go to play.friendlypixel.com`;
            await this.defaultChannel.send({ content: responseMessage });
        }
    }

    private async getMemberCount(): Promise<number> {
        await this.discordGuild.members.fetch();
        var numberOfGuildMembers = this.discordGuild.members.cache.filter(member => !member.user.bot).size;
        return numberOfGuildMembers;
    }

    private async guildHasProcessedDropBefore(): Promise<boolean> {
        const drop = await getDropFromGuild(this.discordGuild.id);
        console.log('guild has processed drop before: ' + (drop !== null));
        return drop !== null;
    }

    private startDropTimer() {
        console.log('starting drop timer for guild ' + this.discordGuild.id);
        this.dropTimer = setTimeout(() => {
            this.handleRandomDrop();
        }, this.getRandomDuration());
    }

    private stopDropTimer() {
        if (this.dropTimer !== null) {
            clearTimeout(this.dropTimer);
        }
    }

    private getRandomDuration() {
        // Generate a random time between 12 and 24 hours in milliseconds
        return Math.floor(Math.random() * (12 * 60 * 60 * 1000)) + (12 * 60 * 60 * 1000);
    }

    private async handleInitialDrop() {
        console.log('handling initial drop for guild ' + this.discordGuild.id);
        const initialDropItem = await getInitialDropItem();
        setTimeout(() => {  
            this.updateDropTables(initialDropItem);
            this.sendMessageOfInitialDroptToGuild(initialDropItem);
        }, 1000 * 30);
    }

    private async handleRandomDrop() { 
        console.log('handling random drop for guild ' + this.discordGuild.id);
        var currencyItems = await getCurrencyItems();
        const randomItem = currencyItems[Math.floor(Math.random() * currencyItems.length)];
    
        await this.updateDropTables(randomItem);
        await this.sendMessageOfDropToGuild(randomItem);
    }

    private async updateDropTables(itemToUpdate: PlayfabItem) { 
        console.log('updating drop tables for guild ' + this.discordGuild.id);
        await insertItemIntoDropTable(itemToUpdate.friendlyId, itemToUpdate.type, this.discordGuild.id);
        await updateLastDropTime(this.discordGuild.id);
    }

    private async sendMessageOfDropToGuild(itemToDrop: PlayfabItem) {
        console.log('sending message of drop to guild ' + this.discordGuild.id);
        // Retrieve the title and the image URL

        // Construct the response message
        const claimText = inlineCode(`/claim`);
        const responseMessage = `A ${itemToDrop.title} just dropped! Use ${claimText} to claim it`;
        await this.defaultChannel.send({ content: responseMessage, files: [itemToDrop.imageUrl] });

        this.startDropTimer();

        // if (avatarItemTypes.includes(randomItem.ContentType)) {
        //     const attachment = await pasteItemOnBodyImage(itemId, imageUrl);
        //     await firstTextChannel.send({ content: responseMessage, files: [attachment] });
        //     fs.unlinkSync(`./ ${itemId}.png`);
        // } 
    }

    private async sendMessageOfInitialDroptToGuild(itemToDrop: PlayfabItem) { 
        const claimText = inlineCode(`/claim`);
        const responseMessage = `Here's ${itemToDrop.title} to get you started! Use ${claimText} to claim it. Use them at play.friendlypixel.com`;
        await this.defaultChannel.send({ content: responseMessage, files: [itemToDrop.imageUrl] });
    }

    

    // async pasteItemOnBodyImage(itemId: string, url: string) { 
    
    //     const bodyImage = await loadImage('./body_main.png');;
    //     if(!fs.existsSync(`./ ${itemId}.png`))
    //     {
    //         await downloadImage(itemId, url);
    //     }
    
    //     const itemImage = await loadImage(`./ ${itemId}.png`)
    //     const canvas = createCanvas(500, 500);
    //     const context = canvas.getContext('2d');
    
    //     context.drawImage(bodyImage, 0, 0, canvas.width, canvas.height);
    //     context.drawImage(itemImage, 0, 0, canvas.width, canvas.height);
    
    //     const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'avatar-image.png' });
    //     return attachment;
    // }
    
    // async downloadImage(itemId: string, url: string): Promise<void>  { 
    //     const response = await axios.get(url, { responseType: 'arraybuffer' });
    //     fs.writeFileSync(`./ ${itemId}.png`, response.data);
    // }
}
