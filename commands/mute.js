exports.run = function (client, message, args) {
    const Discord = require('discord.js');
    message.guild.members.fetch(message.author.id).then(member => {
        if (!member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD, { checkAdmin: true, checkOwner: true })) return message.reply('Insufficant Permissions').catch(console.error)
    })
    var guild = message.guild;
    client.logger.log('info', `mute command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
    const config = client.config;
    let reason = args.slice(1).join(' ')
    let user = message.mentions.users.first()
    // let member = message.guild.member(user)
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } const embed19 = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}mute`)
        .addField("**Usage:**", `${config.prefix}mute <@username> <reason>`)
        .addField("**Example:**", `${config.prefix}mute @AirFusion STAP SPAMMING >.<`)
        .addField("**Expected Result From Example:**", "Mentioned User Muted with Mute Role")
    if (args.join(' ') == "") return message.channel.send({ embeds: [embed19] })
    let muteRole = guild.roles.cache.find(val => val.name === `Mute`)
    if (!muteRole) return message.reply("Mute Role required")
    if (message.mentions.users.size < 1) return message.reply("You must mention someone to mute them.").catch(console.error)
    if (reason.length < 1) return message.reply("Reason Required")
    // if (!message.guild.member(client.user).hasPermission("MANAGE_ROLES"), { checkAdmin: true, checkOwner: true }) return message.reply('Bot has insufficant Perms').catch(console.error)
    message.guild.members.fetch(client.user.id).then(member => {
        if (!member.permissions.has(Discord.Permissions.FLAGS.MANAGE_ROLES)) return message.reply('Bot has insufficant Perms').catch(console.error)
    }) 
    if (user === message.author) return message.reply("You cannot mute yourself")
    message.guild.members.fetch(user.id).then(member => {
        member.roles.add(muteRole).catch(err => console.error(err))
    })
    const embed = new Discord.MessageEmbed()
        .setColor('#ffbf00')
        .setTimestamp()
        .setThumbnail(user.avatarURL)
        .addField('Action:', "Mute")
        .addField('User:', user.username + '#' + user.discriminator)
        .addField("User ID:", user.id)
        .addField("Moderator:", message.author.username + "#" + message.author.discriminator)
        .addField("Reason:", reason)
        .addField("Server:", message.guild.name)


    const embed1 = new Discord.MessageEmbed()
        .setColor('#ffbf00')
        .setTimestamp()
        .setThumbnail(user.avatarURL)
        .addField('Action:', "Mute")
        .addField('User:', user.username + '#' + user.discriminator)
        .addField("User ID:", user.id)
        .addField("Moderator:", message.author.username + "#" + message.author.discriminator)
        .addField("Reason:", reason)

    message.channel.send({ embeds: [embed1] })
    user.send({ embeds: [embed] })
    try {
        guild.channels.cache.find(val1 => val1.name === "modlog").send({ embeds: [embed1] })
    } catch (e) {
        console.error(e)
    }


};