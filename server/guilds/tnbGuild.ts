import { Attachment, Guild, TextChannel, inlineCode, AttachmentBuilder } from 'discord.js';
import {
	getDropFromGuild,
	insertItemIntoDropTable as insertDropIntoTable,
	updateLastDropTime,
} from '../database/queries';
import { getItems, getRandomItemBasedOnWeight } from '../playfab/playfab_catalog';
import { PlayfabItem } from '../playfab/playfab_item';
import { loadImage, createCanvas } from '@napi-rs/canvas';
import { time } from 'console';
import path from 'path';

export class TNBGuild {
	discordGuild: Guild;
	defaultChannel: TextChannel;
	dropTimer: NodeJS.Timeout | null = null;
	timeSinceLastDrop: Date | null = null;
	minimumNumberOfMembers = 10;

	constructor(guild: Guild, defaultChannel: TextChannel, timeSinceLastDrop: Date | null = null) {
		this.discordGuild = guild;
		this.defaultChannel = defaultChannel;
		this.timeSinceLastDrop = timeSinceLastDrop;
	}

	setDefaultChannel(channel: TextChannel) {
		this.defaultChannel = channel;
	}

	async activateBot() {
		const currentMemberCount = await this.getMemberCount();

		///ignores the minimum number of members for the test server
		if (currentMemberCount >= this.minimumNumberOfMembers || this.discordGuild.id === '1091035789376360539') {
			console.log('activating bot for guild ' + this.discordGuild.id);
			if ((await this.guildHasProcessedDropBefore()) === false) {
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
		if (this.dropTimer === null && currentMemberCount >= this.minimumNumberOfMembers) {
			this.startDropTimer();

			if (!this.guildHasProcessedDropBefore()) {
				this.handleInitialDrop();
			}
		}
	}

	async guildRemovedMember() {
		console.log('guild removed a member');
		const currentMemberCount = await this.getMemberCount();
		if (this.dropTimer !== null && currentMemberCount < this.minimumNumberOfMembers) {
			this.stopDropTimer();
		}
	}

	async sendStartMessage() {
		
		const numberOfGuildMembers = await this.getMemberCount();
		if (numberOfGuildMembers < this.minimumNumberOfMembers) {

			try {
				const responseMessage = `The Trust No Bunny bot is now active in this server! Count Cornelio’s caravan will make stops here once the server has reached at least 10 members. To claim the current drop, use the ${inlineCode(
					`/roll`
				)} command. Use ${inlineCode(`/channel set`)} to set which channel the caravn will stop in. To redeem rewards using your ill-gotten gains, go to play.friendlypixel.com`;
				await this.defaultChannel.send({ content: responseMessage });
			} catch {
				console.log("can't send message to guild, likely as a result of the bot having been uninstalled in the guild");
			}
		} else {
			try {
				const responseMessage = `The Trust No Bunny bot is now active in this server! Count Cornelio’s caravan will make occasionally make stops in this server. When his caravan stops by, use the ${inlineCode(
					`/roll`
				)} command to raid his caravan. Use ${inlineCode(`/channel set`)} to set which channel the caravn will stop in. To redeem rewards using your ill-gotten gains, go to play.friendlypixel.com`;
				await this.defaultChannel.send({ content: responseMessage });
			} catch {
				console.log("can't send message to guild, likely as a result of the bot having been uninstalled in the guild");
			}
			
		}
	}

	private async getMemberCount(): Promise<number> {
		console.log('Getting member count...');
		try { 
			console.log('fetching members');
			await this.discordGuild.members.fetch();
			return this.discordGuild.members.cache.filter((member) => !member.user.bot).size;
		} catch {
			console.log('error fetching members, using the cached member count');
			return this.discordGuild.members.cache.filter((member) => !member.user.bot).size;
		}
	}

	private async guildHasProcessedDropBefore(): Promise<boolean> {
		const drop = await getDropFromGuild(this.discordGuild.id);
		console.log('guild has processed drop before: ' + (drop !== null));
		return drop !== null;
	}

	private startDropTimer() {
		console.log('starting drop timer for guild ' + this.discordGuild.id);
		this.dropTimer = setTimeout(() => {
			this.handleDrop();
		}, this.getRandomDuration());
	}

	private stopDropTimer() {
		if (this.dropTimer !== null) {
			clearTimeout(this.dropTimer);
		}
	}

	private getRandomDuration() {
		console.log(this.discordGuild.id + ' is the guild id. Has length of ' + this.discordGuild.id.length);
		const testGuildId = '1091035789376360539';
		console.log('test guild id is ' + testGuildId + ' and has length of ' + testGuildId.length);
		if (this.discordGuild.id === testGuildId) {
			/// this is the test server... uncomment the code below to make the drop happen every minute in the test server
			console.log('guild is the test server, setting drop timer to 1 minute');
			return 1000 * 60;
		}

		if (this.timeSinceLastDrop !== null) {
			console.log('guild has processed drop before it got interrupted, calculating time until next drop for guild ' + this.discordGuild.id);

			const timeSinceLastDrop = new Date().getTime() - this.timeSinceLastDrop.getTime();
			const timeUntilNextDrop = (Math.floor(Math.random() * (24 * 60 * 60 * 1000)) + 24 * 60 * 60 * 1000) - timeSinceLastDrop;
			return timeUntilNextDrop;
		} else {
			console.log('Calculating the discord drop timer the normal way ' + this.discordGuild.id);
			return Math.floor(Math.random() * (24 * 60 * 60 * 1000)) + 24 * 60 * 60 * 1000;
		}
	}

	private async handleInitialDrop() {
		console.log('handling initial drop for guild ' + this.discordGuild.id);
		setTimeout(() => {
			this.handleDrop();
		}, 1000 * 30);
	}

	private async handleDrop() {
		console.log('handling random drop for guild ' + this.discordGuild.id);

		await this.updateDropTables();
		await this.sendMessageOfDropToGuild();
	}

	private async updateDropTables() {
		console.log('updating drop tables for guild ' + this.discordGuild.id);
		await insertDropIntoTable(this.discordGuild.id);
		await updateLastDropTime(this.discordGuild.id);
	}

	private async sendMessageOfDropToGuild() {
		console.log('sending message of drop to guild ' + this.discordGuild.id);

		// Construct the response message
		const rollText = inlineCode(`/roll`);
		const responseMessage = `The nefarious Count Cornelio’s caravan is stopping in town for the night. Dare you help yourself to some of his ill gotten gains? ! Use ${rollText} to infilrate and look for treasure!`;
		const unknownSkImage = await this.retrieveImageOfCountCornelio();

		try {
			await this.defaultChannel.send({ content: responseMessage, files: [unknownSkImage] });
			this.timeSinceLastDrop = new Date();
			this.startDropTimer();
		} catch {
			console.log("can't send message to guild, likely as a result of the bot having been uninstalled in the guild");
		}
	}

	private async retrieveImageOfCountCornelio(): Promise<AttachmentBuilder> {
		console.log('retrieving image of count cornelio');
		const imagePath = path.join(__dirname, '../images/Count_Cornelio.png');
		console.log('loading image with path ' + imagePath);
		const countImage = await loadImage(imagePath);
		const canvas = createCanvas(256, 256);
		const context = canvas.getContext('2d');
		context.drawImage(countImage, 0, 0, canvas.width, canvas.height);
		const attachment = new AttachmentBuilder(await canvas.encode('png'), {
			name: 'Count_Cornelio.png'
		});
		return attachment;
	}
}
