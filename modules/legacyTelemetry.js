function logTelemetry(filename, client, message) {
    const path = require('path')
    var user = message.author

    // local logging
    if (message.guild === null) { // dms
        client.logger.log('info', `legacy${path.basename(filename, '.js')} command used by ${user.username} Time: ${Date()} Guild: null`)

        // GA logging
        client.telemetry.set('cd1', user.username)
        client.telemetry.set('cd2', Buffer.from(user.username).toString('base64'))
        client.telemetry.pageview({
            v: client.pkg.version.replace(/\./g, '').trim(),
            uid: Buffer.from(user.username).toString('base64'),
            dp: `/legacy${path.basename(filename, '.js')}`,
            dt: 'legacy' + path.basename(filename, '.js'),
            dr: 'https://null'
        }).send()
    } else {
        client.logger.log('info', `legacy${path.basename(filename, '.js')} command used by ${user.username} Time: ${Date()} Guild: ${message.guild.name}`)

        // GA logging
        client.telemetry.set('cd1', user.username)
        client.telemetry.set('cd2', Buffer.from(user.username).toString('base64'))
        client.telemetry.pageview({
            v: client.pkg.version.replace(/\./g, '').trim(),
            uid: Buffer.from(user.username).toString('base64'),
            dp: `/legacy${path.basename(filename, '.js')}`,
            dt: 'legacy' + path.basename(filename, '.js'),
            dr: `https://${message.guild.name.replace(/ /g, '')}`
        }).send()
    }
}

module.exports = {
    telemetry: logTelemetry
}
