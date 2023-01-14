module.exports = async (client, guild) => {
    if (!guild.available) return // If there is an outage, return.

    const chalk = require('chalk')
    var Analytics = require('analytics-node')
    var analytics = new Analytics(process.env.TELEMETRYKEY)

    console.log(chalk.white(`Left/Kicked from guild ${guild.name} Size: ${guild.memberCount} Date: ${Date()}`))
    client.logger.log('info', `Left/Kicked from guild ${guild.name} Size: ${guild.memberCount} Date: ${Date()}`)

    analytics.track('Left Guild', {
        guild: guild.name,
        size: guild.memberCount,
        owner: guild.ownerId
    })
}
