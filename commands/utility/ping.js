const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Respond with 'pong!'"),
    async execute(interaction, args, client){
        interaction.reply('pong!');
    }
}