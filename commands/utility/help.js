const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("List of all commands"),
    async execute(interaction, args, client){
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Commandes du serveur discord !')
            .setDescription("Voici les commandes qui sont mises à votre disposition")
            .addFields(
                { name: '/help', value: 'Affiche les commandes du serveur' },
                { name: '/ping', value: "Respond with 'pong!'" },
                { name: '/play name', value: 'Play Deezer Music' },
            )

        interaction.reply({embeds: [embed], ephemeral: true});
    }
}