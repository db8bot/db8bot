function logTelemetry(filename, interaction) {
    const path = require('path')

    // local logging
    interaction.client.logger.log('info', `${path.basename(filename, '.js')} command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)

    // GA logging
    interaction.client.telemetry.set('cd1', interaction.user.username)
    interaction.client.telemetry.set('cd2', Buffer.from(interaction.user.username).toString('base64'))
    interaction.client.telemetry.pageview({
        v: interaction.client.pkg.version.replace(/\./g, '').trim(),
        uid: Buffer.from(interaction.user.username).toString('base64'),
        dp: `/${path.basename(filename, '.js')}`,
        dt: path.basename(filename, '.js'),
        dr: `https://${interaction.guild.name}`
    }).send()
}

module.exports = {
    telemetry: logTelemetry
}
