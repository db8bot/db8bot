exports.run = function (client, message) {
    var guild = message.guild;
    const Discord = require('discord.js')
    message.channel.guild.members.fetch(message.author).then(user => {
        if (user.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) {
            client.scopeUpdate.set(guild.id, true)
            message.channel.send('Reauthorization notice has been turned off. To find the reauthorization link, please use the `-reauth` command.')
            client.logger.log('info', `stopnotice command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
        } else {
            message.channel.send('Insufficient Permissions')
        }
    })
}