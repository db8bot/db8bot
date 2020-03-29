exports.run = function (client, message, args) {

    const Discord = require('discord.js');
    const config = client.config;
    var guild = message.guild;

    const embed = new Discord.MessageEmbed()
        .setColor("#00ffff")
        .setTimestamp()
        .setFooter("Invite Link for " + config.name)
        .addField(`Invite link:`, `[Here](${config.invLink}) | Thanks for inviting ${config.name}!`)

    message.channel.send({embed: embed})
    client.logger.log('info', `invite command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date.now()} Guild: ${guild}`)
}