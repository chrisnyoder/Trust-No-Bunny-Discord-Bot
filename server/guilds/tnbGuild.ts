import { Attachment, Guild, TextChannel, inlineCode, AttachmentBuilder } from 'discord.js';
import {
	getDropFromGuild,
	insertItemIntoDropTable as insertDropIntoTable,
	updateLastDropTime,
} from '../database/queries';
import { loadImage, createCanvas } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import { getLocalizedText } from '../localization/localization_manager';
import { get } from 'http';

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
		if (this.dropTimer === null && (currentMemberCount >= this.minimumNumberOfMembers || this.discordGuild.id === '1091035789376360539')) {
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
				const responseMessageUnformatted = getLocalizedText(this.discordGuild.preferredLocale, 'bot_messages.start_message_under_10_members') as string;
				var responseMessageFormated = responseMessageUnformatted
					.replace('{roll_command}', inlineCode(getLocalizedText(this.discordGuild.preferredLocale, 'command_interactions.roll_command.name') as string))
					.replace('{channel_set_command}', inlineCode(getLocalizedText(this.discordGuild.preferredLocale, 'command_interactions.channel_set_command.name') as string));
				
				await this.defaultChannel.send({ content: responseMessageFormated });
			} catch {
				console.log("can't send message to guild, likely as a result of the bot having been uninstalled in the guild");
			}
		} else {
			try {
				const responseMessageUnformatted = getLocalizedText(this.discordGuild.preferredLocale, 'bot_messages.start_message_10_members') as string;
				const responseMessageFormated = responseMessageUnformatted
					.replace('{roll_command}', inlineCode(getLocalizedText(this.discordGuild.preferredLocale, 'command_interactions.roll_command.name') as string))
					.replace('{channel_set_command}', inlineCode(getLocalizedText(this.discordGuild.preferredLocale, 'command_interactions.channel_set_command.name') as string));
				
				await this.defaultChannel.send({ content: responseMessageFormated });
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
		const testGuildId = '1091035789376360539';
		if (this.discordGuild.id === testGuildId) {
			/// this is the test server... uncomment the code below to make the drop happen every minute in the test server
			console.log('guild is the test server, setting drop timer to 1 minute');
			// return 1000 * 60;
		}

		if (this.timeSinceLastDrop !== null) {
			console.log('guild has processed drop before it got interrupted, calculating time until next drop for guild ' + this.discordGuild.id);

			const timeSinceLastDrop = new Date().getTime() - this.timeSinceLastDrop.getTime();
			const timeUntilNextDrop = (Math.floor(Math.random() * (24 * 60 * 60 * 1000)) + 24 * 60 * 60 * 1000) - timeSinceLastDrop;
			console.log(`Processing next drop at ${timeUntilNextDrop}`);
			return timeUntilNextDrop;
		} else {
			console.log('Calculating the discord drop timer the normal way ' + this.discordGuild.id);
			const timeUntilNextDrop = Math.floor(Math.random() * (24 * 60 * 60 * 1000)) + 24 * 60 * 60 * 1000;
			console.log(`Processing next drop at ${timeUntilNextDrop}`);
			return timeUntilNextDrop;
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
		const responseMessageUnformatted = getLocalizedText(this.discordGuild.preferredLocale, 'bot_messages.caravan_stop') as string;
		const responseMessageFormatted = responseMessageUnformatted.replace('{roll_command}', inlineCode(getLocalizedText(this.discordGuild.preferredLocale, 'command_interactions.roll_command.name') as string));
		const countCornelioImage = await this.retrieveImageOfCountCornelio();

		try {
			await this.defaultChannel.send({ content: responseMessageFormatted, files: [countCornelioImage as AttachmentBuilder] });
			this.timeSinceLastDrop = new Date();
			this.startDropTimer();
		} catch {
			console.log("can't send message to guild, likely as a result of the bot having been uninstalled in the guild");
		}
	}

	private async retrieveImageOfCountCornelio(): Promise<AttachmentBuilder | null> {
		try { 
			const imagePath = './images/Count_Cornelio.png';	
			const imageBuffer = fs.readFileSync(imagePath);
			const countImage = await loadImage(imageBuffer);
	
			const canvas = createCanvas(256, 256);
			const context = canvas.getContext('2d');
			context.drawImage(countImage, 0, 0, canvas.width, canvas.height);
			const attachment = new AttachmentBuilder(await canvas.encode('png'), {
				name: 'Count_Cornelio.png'
			});
			return attachment;
		} catch {
			console.log('error retrieving image of count cornelio');
			return null;
		}
	}
}
