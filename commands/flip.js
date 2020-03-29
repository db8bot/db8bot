exports.run = function (client, message, args) {
    message.channel.send((Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails');
    client.logger.log('info', `flip command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
}