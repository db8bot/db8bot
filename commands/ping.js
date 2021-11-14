const { SlashCommandBuilder } = require('@discordjs/builders')
const { v4: uuidv4 } = require('uuid')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        interaction.client.logger.log('info', `ping command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        await interaction.reply(':ping_pong: Pinging...')
        interaction.fetchReply()
            .then(reply => {
                interaction.editReply(`:ping_pong: Pong! Latency is ${Date.now() - reply.createdTimestamp}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`)
            })
    }
}
