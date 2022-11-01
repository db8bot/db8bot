var Analytics = require('analytics-node')
var analytics = new Analytics(process.env.TELEMETRYKEY)
const path = require('path')

function logTememetry(filename, interaction) {
    // user id: base64 tag

    interaction.client.logger.log('info', `${path.basename(filename, '.js')} command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild === null ? 'nullDM' : interaction.guild.name}`)

    if (interaction.guild === null) { // interaction in dms
        analytics.identify({
            userId: Buffer.from(interaction.user.tag).toString('base64'),
            traits: {
                username: interaction.user.tag,
                website: 'nullDM'
            }
        })
        analytics.page({
            userId: Buffer.from(interaction.user.tag).toString('base64'),
            category: 'Command',
            name: path.basename(filename, '.js'),
            properties: {
                url: 'https://db8.bot',
                path: `/${path.basename(filename, '.js')}`,
                title: path.basename(filename, '.js'),
                referrer: 'nullDM'
            }
        })
    } else {
        analytics.identify({
            userId: Buffer.from(interaction.user.tag).toString('base64'),
            traits: {
                username: interaction.user.tag,
                website: interaction.guild.name.replace(/ /g, '')
            }
        })
        analytics.page({
            userId: Buffer.from(interaction.user.tag).toString('base64'),
            category: 'Command',
            name: path.basename(filename, '.js'),
            properties: {
                url: 'https://db8.bot',
                path: `/${path.basename(filename, '.js')}`,
                title: path.basename(filename, '.js'),
                referrer: interaction.guild.name.replace(/ /g, '')
            }
        })
    }
}

module.exports = {
    telemetry: logTememetry
}
