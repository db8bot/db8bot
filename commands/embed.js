exports.run = function (client, message, args) {
    const Discord = require('discord.js');
    const config = client.config;
    const embed1 = new Discord.MessageEmbed()
    .setColor("#f0ffff")
    .setDescription("**Command: **" + `${config.prefix}embed`)
    .addField("**Usage:**", `${config.prefix}embed <message to embed>`)
    .addField("**Example:**", `${config.prefix}embed hello`)
    .addField("**Expected Result From Example:**", "Bot will send a embeded message to channel containing your message.")
    // .addField("**Alies**", "-msg")
if (args.join(' ')==="") return message.channel.send({ embed: embed1 })
    const embed = new Discord.MessageEmbed()
        .setColor("#3f00ff")
        .setAuthor("Author: " + message.author.username + "\n")
        .setFooter("ID: " + message.author.id)
        .addField("Message:", args.join(' '))
    message.channel.send({ embed: embed })
    client.logger.log('info', `embed command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
}