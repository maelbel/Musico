const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { player } = require('../commands/utility/play');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()){
            const client = interaction.client;
            const command = client.commands.get(interaction.commandName);
            const args = interaction.options;
    
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
    
            try {
                await command.execute(interaction, args, client);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {

            const connection = getVoiceConnection(interaction.member.voice.channel.guild.id);
            
            // // Get player, subscription, connection
            const play = new ButtonBuilder()
                .setCustomId('play')
                .setEmoji('1051612861769711706')
                .setStyle(ButtonStyle.Success);
    
            const pause = new ButtonBuilder()
                .setCustomId('pause')
                .setEmoji('1051613645219569705')
                .setStyle(ButtonStyle.Secondary);
    
            const next = new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('1051614199769469008')
                .setStyle(ButtonStyle.Secondary);		
    
            const stop = new ButtonBuilder()
                .setCustomId('stop')
                .setEmoji('1051615255605805127')
                .setStyle(ButtonStyle.Secondary);
            
            if (interaction.customId === 'stop') {
                player.stop();
                connection.destroy();
                await interaction.update({
                    content: "Music stopped and bot disconnected",
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
    
            } else if (interaction.customId === 'play') {
                player.unpause();
                const row = new ActionRowBuilder()
                    .addComponents( pause, next, stop);
    
                await interaction.update({
                    components: [row]
                });
            } else if (interaction.customId === 'pause') {
                player.pause();
                const row = new ActionRowBuilder()
                    .addComponents(play, next, stop);
    
                await interaction.update({
                    components: [row]
                });
            }
        } else if (interaction.isStringSelectMenu()) {
            // respond to the select menu
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
    
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
    
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        } else {return;}
	},
};