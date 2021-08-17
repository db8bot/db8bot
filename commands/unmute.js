exports.run = function (client, message, args) {
    message.guild.members.fetch(message.author.id).then(member => {
        if (!member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD, { checkAdmin: true, checkOwner: true })) return message.reply('Insufficant Permissions').catch(console.error)
    })
    var guild = message.guild;
    client.logger.log('info', `unmute command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
    const Discord = require('discord.js');
    const config = require("../config.json");
    let user = message.mentions.users.first()
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } const embed19 = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}unmute`)
        .addField("**Usage:**", `${config.prefix}unmute <@username>`)
        .addField("**Example:**", `${config.prefix}unmute @AirFusion`)
        .addField("**Expected Result From Example:**", "Mentioned user should be unmuted.")
    if (args.join(' ') == "") return message.channel.send({ embeds: [embed19] })
    let muteRole = guild.roles.cache.find(val => val.name === `Mute`)
    if (!muteRole) return message.reply("Mute Role required")
    if (message.mentions.users.size < 1) return message.reply("You must mention someone to mute them.").catch(console.error)
    if (user === message.author) return message.reply("You cannot unmute yourself")
    message.guild.members.fetch(client.user.id).then(member => {
        if (!member.permissions.has(Discord.Permissions.FLAGS.MANAGE_ROLES)) return message.reply('Bot has insufficant Perms').catch(console.error)
    })
    message.guild.members.fetch(user).then(member => {
        if (member.roles.cache.has(muteRole.id)) {
            member.roles.remove(muteRole).catch(err => console.log(err))
        }
    })


    const embed = new Discord.MessageEmbed()
        .setColor('#00008b')
        .setTimestamp()
        .setThumbnail(user.avatarURL)
        .addField('Action:', "UnMute")
        .addField('User:', user.username + '#' + user.discriminator)
        .addField("User ID:", user.id)
        .addField("Moderator:", message.author.username + "#" + message.author.discriminator)
        .addField("Server:", message.guild.name)


    const embed1 = new Discord.MessageEmbed()
        .setColor('#00008b')
        .setTimestamp()
        .setThumbnail(user.avatarURL)
        .addField('Action:', "UnMute")
        .addField('User:', user.username + '#' + user.discriminator)
        .addField("User ID:", user.id)
        .addField("Moderator:", message.author.username + "#" + message.author.discriminator)

    message.channel.send({ embeds: [embed1] })
    user.send({ embeds: [embed] })
    try {
        guild.channels.cache.find(val1 => val1.name === "modlog").send({ embeds: [embed1] }).catch(err => console.error(err));
    } catch (e) {
        console.log(e)
    }
};