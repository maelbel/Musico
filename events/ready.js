const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
        client.user.setPresence({ status: 'online' });
        client.user.setActivity(`Développement en cours...`, {type: 4});
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};