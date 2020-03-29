exports.run = function (client, message, args) {
    if (!message.guild.member(message.author).hasPermission('MANAGE_ROLES_OR_PERMISSIONS')) return message.reply('Insufficant Permissions').catch(console.error)
    var guild = message.guild;
    client.logger.log('info', `mute command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${guild}`)
    const Discord = require('discord.js');
    const config = client.config;
    let reason = args.slice(1).join(' ')
    let user = message.mentions.users.first()
    let member = message.guild.member(user)
    const embed19 = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}mute`)
        .addField("**Usage:**", `${config.prefix}mute <@username> <reason>`)
        .addField("**Example:**", `${config.prefix}mute @AirFusion STAP SPAMMING >.<`)
        .addField("**Expected Result From Example:**", "Mentioned User Muted with Mute Role")
    if (args.join(' ') == "") return message.channel.send({ embed: embed19 })
    // let muteRole = client.channels.cache.get(message.guild.id).roles.find(val => val.name === 'Mute')
    let muteRole = guild.roles.cache.find(val => val.name === `Mute`)
    if (!muteRole) return message.reply("Mute Role required")
    if (message.mentions.users.size < 1) return message.reply("You must mention someone to mute them.").catch(console.error)
    if (reason.length < 1) return message.reply("Reason Required")
    if (!message.guild.member(client.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) return message.reply('Bot has insufficant Perms').catch(console.error)
    if (user === message.author) return message.reply("You cannot mute yourself")
    message.guild.member(user).roles.add(muteRole).catch(err => console.error(err))

    const embed = new Discord.MessageEmbed()
        .setColor('#ffbf00')
        .setTimestamp()
        .setThumbnail(user.avatarURL)
        .addField('Action:', "Mute")
        .addField('User:', user.username + '#' + user.discriminator)
        .addField("User ID:", user.id)
        .addField("Moderator:", message.author.username + "#" + message.author.discriminator)
        .addField("Reason:", reason)
        .addField("Server:", message.guild)


    const embed1 = new Discord.MessageEmbed()
        .setColor('#ffbf00')
        .setTimestamp()
        .setThumbnail(user.avatarURL)
        .addField('Action:', "Mute")
        .addField('User:', user.username + '#' + user.discriminator)
        .addField("User ID:", user.id)
        .addField("Moderator:", message.author.username + "#" + message.author.discriminator)
        .addField("Reason:", reason)

    message.channel.send({ embed: embed1 })
    user.send({ embed: embed })
    guild.channels.cache.find(val1 => val1.name === "modlog").send({ embed: embed1 }).catch(err => console.error(err));


};