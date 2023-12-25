const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, createAudioResource  } = require('@discordjs/voice');
const config = require('../../config.json');
const ytdl = require('ytdl-core');

//create audio player
const player = createAudioPlayer();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("playlist")
        .setDescription("Play Deezer playlist")
        .addStringOption(option => option
            .setName("name")
            .setDescription("Name of the playlist")
            .setRequired(true)
			.setAutocomplete(true)),
	async autocomplete(interaction) {
		// Faire la recherche par nom ici
		const focusedOption = interaction.options.getFocused(true);
		let choices = [];

		if (focusedOption.name === 'name' && focusedOption.value) {
			const query = focusedOption.value;

			const result = await fetch("https://api.deezer.com/search/playlist?q=" + query);
			const result_json = await result.json();

			if(result_json.data){
				for (let i = 0; i < 5; i++) {
					if(result_json.data[i] && result_json.data[i].title){
						let title = result_json.data[i].title;
						let user = result_json.data[i].user.name;
                        
						let nb_tracks = result_json.data[i].nb_tracks;
                        (result_json.data[i].nb_tracks > 1) ? nb_tracks += " tracks" : nb_tracks += " track";

						choices.push(user + ' - ' + title + ' - ' + nb_tracks);
					}					
				}
			}
		} else {
			choices = ["User 1 - Playlist 1 - X tracks", 
						"User 2 - Playlist 2 - X tracks", 
						"User 3 - Playlist 3 - X tracks", 
						"User n - Playlit n - X tracks", 
						"User n+1 - Playlist n+1 - X tracks"];
		}

		await interaction.respond(
			choices.map(choice => ({ name: choice, value: choice })),
		);
	},
    async execute(interaction, args, client){
        
		if (!interaction.member.voice.channel) { return await interaction.reply({ content: 'You need to enter a voice channel before use the command', ephemeral: true }) }

        //get the voice channel ids
		const voiceChannelId = interaction.member.voice.channel.id;
		const voiceChannel = client.channels.cache.get(voiceChannelId);
		const guildId = config.guildId;

		player.on(AudioPlayerStatus.Playing, () => {
			console.log('The audio player has started playing!');
		});

		player.on('stateChange', (oldState, newState) => {
			console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
		});

		player.on('error', error => {
			console.error(`Error: ${error.message} with resource`);
		});

		const query = args.getString("name");
		const split_query = query.split(' - ');

		//https://api.deezer.com/search?q=artist:"aloe blacc" track:"i need a dollar"
		const search = await fetch('https://api.deezer.com/search/playlist?q=' + split_query[1].trim());
		const result_search = await search.json();

		const result = await fetch('https://api.deezer.com/track/' + result_search.data[0].id);
		const result_json = await result.json();

		//create and play audio
		const resource = createAudioResource(result_json.preview, {
			inputType: 'url'
		});
		player.play(resource);

		//create the connection to the voice channel
		const connection = joinVoiceChannel({
			channelId: voiceChannelId,
			guildId: guildId,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

        // Subscribe the connection to the audio player (will play audio on the voice connection)
		const subscription = connection.subscribe(player);

		const embed = new EmbedBuilder()
            .setColor('#cb257d')
            .addFields(
                { name: 'Now playing', value: `[${result_json.title}](${result_json.link}) -${split_query[2]}` },
				{ name: 'Launched by', value: `${interaction.member}` }
            )
			.setThumbnail(result_json.album.cover_medium);

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
		
		const row = new ActionRowBuilder()
			.addComponents(pause, next, stop);

        const response = await interaction.reply({
			embeds: [embed], 
			components: [row]
		});
    },
	player
}