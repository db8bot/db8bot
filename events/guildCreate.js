module.exports = async (client, guild) => {
    const chalk = require('chalk')

    console.log(chalk.white(`Joined guild ${guild.name} Size: ${guild.memberCount} Date: ${Date()}`))
    client.logger.log('info', `Joined guild ${guild.name} Size: ${guild.memberCount} Date: ${Date()}`)

    client.telemetry.set('cd1', '')
    client.telemetry.set('cd2', '')
    client.telemetry.event({
        v: client.pkg.version.replace(/\./g, '').trim(),
        eventCategory: 'guild',
        eventAction: 'join',
        el: guild.name,
        ev: guild.memberCount
    }).send()
}
