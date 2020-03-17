exports.run = function (client, message, args) {
    var guild = message.guild;
    const config = client.config;
    const filter = require('leo-profanity')
    message.delete()
    client.options.disableEveryone = true;
    message.channel.send(filter.clean(args.join(' ')))
}