import { Guild, TextChannel, inlineCode } from 'discord.js';
import { getDropFromGuild, insertItemIntoDropTable, updateLastDropTime } from '../database/queries';
import { getItems, getCurrencyItems, getInitialDropItem  } from '../playfab/playfab_catalog';

export class TNBGuild {
    
    discordGuild: Guild;
    defaultChannel: TextChannel;
    dropTimer: NodeJS.Timeout | null = null;
    minimumNumberOfMembers = 10;

    constructor(guild: Guild, defaultChannel: TextChannel) {
        this.discordGuild = guild;
        this.defaultChannel = defaultChannel;
    }

    setDefaultChannel(channel: TextChannel) {
        this.defaultChannel = channel;
    }

    activateBot() { 
        console.log('activating bot for guild ' + this.discordGuild.id);
        if (!this.guildHasProcessedDropBefore()) {
            this.handleInitialDrop();
        }
        this.startDropTimer();
        this.sendStartMessage(this.discordGuild);
    }

    deactiveBot() {
        this.stopDropTimer();
    }

    async guildAddedMember() {
        const currentMemberCount = await this.getMemberCount();
        if(this.dropTimer === null && currentMemberCount >= this.minimumNumberOfMembers) {
            this.startDropTimer();

            if (!this.guildHasProcessedDropBefore()) {
                this.handleInitialDrop();
            }
        }
    }

    async guildRemovedMember() {
        const currentMemberCount = await this.getMemberCount();
        if(this.dropTimer !== null && currentMemberCount < this.minimumNumberOfMembers) {
            this.stopDropTimer();
        }
    }

    private async getMemberCount(): Promise<number> {
        await this.discordGuild.members.fetch();
        var numberOfGuildMembers = this.discordGuild.members.cache.filter(member => !member.user.bot).size;
        return numberOfGuildMembers;
    }

    private async guildHasProcessedDropBefore(): Promise<boolean> {
        const drop = await getDropFromGuild(this.discordGuild.id);
        return drop !== null;
    }

    private startDropTimer() {
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
        await this.updateDropTables(initialDropItem);
        await this.sendMessageOfDropToGuild(initialDropItem);
    }

    private async handleRandomDrop() { 
        console.log('handling random drop for guild ' + this.discordGuild.id);
        var currencyItems = getCurrencyItems();
        const randomItem = currencyItems[Math.floor(Math.random() * currencyItems.length)];
    
        await this.updateDropTables(randomItem);
        await this.sendMessageOfDropToGuild(randomItem);
    }

    private async sendStartMessage(guild: Guild) {
        const responseMessage = `The Trust No Bunny bot is now active in this server! Random drops will now occur in this server. To claim the current drop, use the ${inlineCode(`/claim <item>`)} command. To redeem rewards using your currency, go to play.friendlypixel.com`;
        await this.defaultChannel.send({ content: responseMessage });
    }

    private async updateDropTables(randomItem: any) { 
        const itemId = randomItem.AlternateIds[0].Value;
        const itemType = randomItem.ContentType;
        await insertItemIntoDropTable(itemId, itemType, this.discordGuild.id);
        await updateLastDropTime(this.discordGuild.id);
        this.startDropTimer();
    }

    private async sendMessageOfDropToGuild(randomItem: any) {
        // Retrieve the title and the image URL
        const title = randomItem.Title.NEUTRAL;
        const itemId = randomItem.AlternateIds[0].Value;
        const imageUrl = randomItem.Images[0].Url;

        // Construct the response message
        const claimText = inlineCode(`/claim <item>`);
        const responseMessage = `A ${title} just dropped! Use ${claimText} to claim it`;
        await this.defaultChannel.send({ content: responseMessage, files: [imageUrl] });

        // if (avatarItemTypes.includes(randomItem.ContentType)) {
        //     const attachment = await pasteItemOnBodyImage(itemId, imageUrl);
        //     await firstTextChannel.send({ content: responseMessage, files: [attachment] });
        //     fs.unlinkSync(`./ ${itemId}.png`);
        // } 
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
