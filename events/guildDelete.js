module.exports = async (client, guild) => {
    const chalk = require('chalk')
    if (!guild.available) return // If there is an outage, return.

    console.log(chalk.white(`Left/Kicked from guild ${guild.name} Size: ${guild.memberCount} Date: ${Date()}`))
    client.logger.log('info', `Left/Kicked from guild ${guild.name} Size: ${guild.memberCount} Date: ${Date()}`)

    client.telemetry.set('cd1', '')
    client.telemetry.set('cd2', '')
    client.telemetry.event({
        v: client.pkg.version.replace(/\./g, '').trim(),
        eventCategory: 'guild',
        eventAction: 'leave',
        el: guild.name,
        ev: guild.memberCount
    }).send()
}
