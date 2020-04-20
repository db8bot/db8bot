exports.run = function (client, message, args) {
    const Discord = require('discord.js');
    const config = client.config;
    var guild = message.guild;
    let game = ''
    let customStatus = ''
    let mentionedObj = message.mentions.users.first()
    let user;
    if (message.mentions.users.first()) {
        user = message.channel.guild.members.cache.get(message.mentions.users.first().id);
        // message.channel.send(message.mentions.users.first().id)
        // message.channel.send(user.id)
    }
    // 280148284826189827
    let mentioned = message.mentions.users.first();
    // console.log(user)
    // for (var i=0; i<1; i++) {
    if (message.author === user || !user) {
        if (message.author.presence.activities[0] === null || message.author.presence.activities[0] === undefined || message.author.presence.activities[0] === "") {
            game = 'Nothing'
            customStatus = 'Nothing'
        }
        else if (message.author.presence.activities[0].name === "Custom Status") {
        // else if (message.author.presence.activities[0]===undefined) {
            if (message.author.presence.activities[1]) {
                game = message.author.presence.activities[1].name;
            } else {
                game = 'Nothing'
            }
            customStatus = message.author.presence.activities[0].name + ": " + message.author.presence.activities[0].state
        } 
        else {
            game = message.author.presence.activities[0].name;
            customStatus = 'Nothing'
        }
        const userInfo = new Discord.MessageEmbed()
            .setAuthor(`User Info for ${message.author.tag} - ID: ${message.author.id}`)
            .setColor('#2D7FFF')
            .setThumbnail(message.author.avatarURL())
            // .addField('Discriminator: ', message.author.discriminator)
            .addField('Status', message.author.presence.status === "dnd" ? "Do Not Disturb" : message.author.presence.status, true)
            .addField('Activity', game, true)
            .addField('Custom Activity', customStatus, true)
            .addField('Joined Server', message.member.joinedAt)
            .addField('Created Account', message.author.createdAt)
            .addField('Roles', message.member.roles.cache.size > 0 ? message.member.roles.cache.map(d => d.name).join(', ') : 'None')
        message.channel.send({ embed: userInfo })
    }
    else {

        // if (user.presence.activities === null) {
        //     game = 'Nothing'
        // }
        // else {
        //     game = user.presence.activities.name
        // }
        // console.log(user.presence.activities)
        if (user.presence.activities[0] === undefined) {
            game = 'Nothing'
            customStatus = 'Nothing'
        }
        else if (user.presence.activities[0].name === "Custom Status") {
            if (user.presence.activities[1]) {
                game = user.presence.activities[1].name;
            } else {
                game = 'Nothing'
            }
            customStatus = user.presence.activities[0].name + ": " + user.presence.activities[0].state
        } else {
            game = user.presence.activities[0].name;
            customStatus = 'Nothing'
        }
        // console.log(user)
        // console.log(user[0])
        // console.log(user.presence.activities)
        var date = new Date(user.joinedTimestamp * 1000);
        // message.channel.send(user.joinedTimestamp)
        const userInfo = new Discord.MessageEmbed()
            .setAuthor(`User Info for ${mentionedObj.tag} - ID: ${user.id}`)
            .setColor('#2D7FFF')
            .setThumbnail(user.avatar===null?null:user.avatar)
            // .addField('Discriminator: ', user.discriminator)
            .addField('Status', user.presence.status === "dnd" ? "Do Not Disturb" : user.presence.status, true)
            // .addField('Playing', game, true)
            .addField('Activity', game, true)
            .addField('Custom Activity', customStatus, true)
            .addField('Joined Server', date.toString(), true)
            .addField('Created Account', mentioned.createdAt, true)
            .addField('Roles', user.roles.cache.size > 0 ? user.roles.cache.map(d => d.name).join(', ') : 'None')

        message.channel.send({ embed: userInfo })
    }
    client.logger.log('info', `userinfo command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${guild}`)

};