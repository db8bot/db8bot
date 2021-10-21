exports.run = function (client, message) {

    client.scopeUpdate.set(guild.id, true)
    message.channel.send('Reauthorization notice has been turned off.')
    client.logger.log('info', `stopnotice command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
}