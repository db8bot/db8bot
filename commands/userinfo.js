exports.run = function (client, message, args) {
    const Discord = require('discord.js');
    const config = client.config;
    var guild = message.guild;
    let game = ''
    let customStatus = ''
    let user = message.mentions.users.first()
    console.log(user)
    if (message.author === user || !user) {
        if (message.author.activities === null) {
            game = 'Nothing'
            customStatus = 'Nothing'
        }
        else if (message.author.presence.activities[0].name==="Custom Status") {
            game = message.author.presence.activities[1].name;
            customStatus = message.author.presence.activities[0].name + " " + message.author.presence.activities[0].state
        } else {
            game = message.author.presence.activities[0].name;
            customStatus = 'Nothing'
        }
        const userInfo = new Discord.MessageEmbed()
            .setAuthor('User Info For ' + message.author.username)
            .setColor('#2D7FFF')
            .setThumbnail(message.author.avatarURL)
            .addField('Discriminator: ', message.author.discriminator)
            .addField('Status', message.author.presence.status==="dnd"?"Do Not Disturb":message.author.presence.status, true)
            .addField('Activity', game, true)
            .addField('Custom Activity', customStatus, true )
            .addField('Joined Server', message.member.joinedAt)
            .addField('Created Account', message.author.createdAt)
            .addField('Roles', message.member.roles.size > 0 ? message.member.roles.map(d => d.name).join(', ') : 'None')
        message.channel.send({ embed: userInfo })
    }
    else {

        if (user.presence.activities === null) {
            game = 'Nothing'
        }
        else {
            game = user.presence.activities.name
        }
        const userInfo = new Discord.MessageEmbed()
            .setAuthor('User Info For ' + user.username)
            .setColor('#2D7FFF')
            .setThumbnail(user.avatarURL)
            .addField('Discriminator: ', user.discriminator)
            .addField('Status', message.author.presence.status==="dnd"?"Do Not Disturb":message.author.presence.status, true)
            // .addField('Playing', game, true)
            .addField('Created Account', user.createdAt)

        message.channel.send({ embed: userInfo })
    }
    // logger.log('info', `Userinfo command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${guild}`)

};