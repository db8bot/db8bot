exports.run = async function (client, message, args) {
    const Discord = require('discord.js');
    const config = client.config;
    var guild = message.guild;
    let mentionedObj = message.mentions.users.first()
    let user;
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    }
    if (message.mentions.users.first()) {
        user = await message.channel.guild.members.fetch(message.mentions.users.first().id)
        if (!client.optINOUT.get(user.id) === undefined) {
            if (client.optINOUT.get(user.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send(`The user you are mentioning has opted out of the service: ${__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js"))}.`)
        }
    }
    let mentioned = message.mentions.users.first();
    if (message.author === user || !user) {
        const userInfo = new Discord.MessageEmbed()
            .setAuthor(`User Info for ${message.author.tag} - ID: ${message.author.id}`)
            .setColor('#2D7FFF')
            .setThumbnail(message.author.avatarURL())
            .addField('Joined Server', "" + message.member.joinedAt)
            .addField('Created Account', "" + message.author.createdAt)
            .addField('Roles', message.member.roles.cache.size > 0 ? message.member.roles.cache.map(d => d.name).join(', ') : 'None')
        message.channel.send({ embeds: [userInfo] })
    }
    else {
        var date = new Date(user.joinedTimestamp);
        const userInfo = new Discord.MessageEmbed()
            .setAuthor(`User Info for ${mentionedObj.tag} - ID: ${user.id}`)
            .setColor('#2D7FFF')
            .setThumbnail(user.user.avatarURL() === null ? null : user.user.avatarURL())
            .addField('Joined Server', date.toString(), true)
            .addField('Created Account', "" + mentioned.createdAt, true)
            .addField('Roles', user.roles.cache.size > 0 ? user.roles.cache.map(d => d.name).join(', ') : 'None')

        message.channel.send({ embeds: [userInfo] })
    }
    client.logger.log('info', `userinfo command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)

};