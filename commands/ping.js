const { SlashCommandBuilder } = require('@discordjs/builders')
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        interaction.client.logger.log('info', `ping command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        console.log(Buffer.from(interaction.user.username).toString('base64'))
        interaction.client.telemetry.set('cd[1]', interaction.user.username)
        interaction.client.telemetry.pageview({
            v: interaction.client.pkg.version.replace(/\./g, '').trim(),
            cid: interaction.user.username, // old client id
            // uid: interaction.user.username, // trial 1
            uid: Buffer.from(interaction.user.username).toString('base64'), // trial 2
            // uid: 'dGVzdGluZyB0ZXN0aW5nPQ==', // trial 3
            dp: `/${path.basename(__filename, '.js')}`,
            dt: path.basename(__filename, '.js'),
            // dr: `https://discord.com/server/${interaction.guild.name}`
            dr: 'https://testserver' // trail 2
        }).send()

        await interaction.reply(':ping_pong: Pinging...')
        interaction.fetchReply()
            .then(reply => {
                interaction.editReply(`:ping_pong: Pong! Latency is ${Date.now() - reply.createdTimestamp}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`)
            })
    }
}
