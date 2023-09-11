import { SlashCommandBuilder, ChatInputCommandInteraction, inlineCode, ChannelType, TextChannel, PermissionFlagsBits } from 'discord.js';
import { setDefaultChannel } from '../guilds/guilds';
import { getLocalizedText } from '../localization/localization_manager';

const command = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Sets the default text channel for where drops occur')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => 
            subcommand
                .setName('set')
                .setDescription('Sets the default text channel for where drops occur')
                .addChannelOption(option =>
                    option
                        .setName('channel_name')
                        .setDescription("Channel you want the TNB bot to post drops in")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
        )
    ,
    async execute(interaction: ChatInputCommandInteraction) {
        
        if (!interaction.isChatInputCommand) { 
            return;
        }

        if (typeof interaction.guild?.id === 'undefined') { 
            console.log('oops! this command was not made in a Discord server. Not processing');
            return; 
        }
        
        const channel = interaction.options.getChannel('channel_name') as TextChannel;
        setDefaultChannel(interaction.guild?.id as string, channel);

        const responseMessage = getLocalizedText(interaction.locale, 'command_interactions.channel_set_command.message') as string;
        await interaction.reply({content: responseMessage, ephemeral: true})      
    }
};

export = command;