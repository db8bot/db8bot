const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        await interaction.reply(':ping_pong: Pinging...')
        interaction.fetchReply()
            .then(reply => {
                interaction.editReply(`:ping_pong: Pong! Latency: \`${Date.now() - reply.createdTimestamp}ms\` | API Latency:\`${Math.round(interaction.client.ws.ping)}ms\``)
            })
    }
}
// I am the bestest person ever :) - Pyr
