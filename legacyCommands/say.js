exports.run = function (client, message, args) {
    const config = client.config
    const Filter = require('bad-words')
    var filter = new Filter()
    message.delete()
    client.options.disableMentions = 'all'
    if (message.author.id != config.OWNER) {
        message.channel.send(filter.clean(args.join(' ')) + `\n**-${message.author.tag}**`)
    } else if (message.author.id === config.OWNER) {
        client.options.disableMentions = 'none'
        message.channel.send(args.join(' '))
    }
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
}
