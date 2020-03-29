exports.run = function (client, message, args) {
    const Discord = require('discord.js');
    const config = client.config;

    const embed = new Discord.MessageEmbed()
        .setColor("#3f00ff")
        .setAuthor("Author: " + message.author.username + "\n")
        .setFooter("ID: " + message.author.id)
        .addField("Message:", args.join(' '))
    message.channel.send({ embed: embed })
    client.logger.log('info', `embed command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
}