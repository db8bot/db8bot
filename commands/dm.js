exports.run = function (client, message, args, args2, cmd) {
    const Discord = require('discord.js');
    var guild = message.guild;
    let user = message.mentions.users.first()
    const config = client.config;
    const embed1 = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}dm`)
        .addField("**Usage:**", `${config.prefix}dm <@username> <Your message>`)
        .addField("**Example:**", `${config.prefix}dm @AirFusion hello`)
        .addField("**Expected Result From Example:**", "Mentioned user should get a DM from the bot with the correct message & message in chat should be deleted.")
        // .addField("**Alies**", "-msg")
    if (!user || args[1]===undefined) return message.channel.send({ embed: embed1 })
    const embed = new Discord.MessageEmbed()
        .setColor("#008000")
        .setTitle(`You Have a New Message From ${message.author.username}`)
        .setDescription("ID: " + message.author.id)
        .setThumbnail(message.author.avatarURL)
        .setTimestamp()
        .addField("Message:", args.slice(1).join(' '))
        .setFooter("Reply by using the command -dm @<replyUser> <message>")
    user.send({ embed: embed })
    message.delete()
    message.reply("Message sent!")
    client.logger.log('info', `dm command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${guild}`)
}