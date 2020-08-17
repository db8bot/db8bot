exports.run = function (client, message, args) {
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } message.channel.send((Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails');
    client.logger.log('info', `flip command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
}