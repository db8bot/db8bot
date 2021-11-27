const Discord = require('discord.js')

exports.run = function (client, message, args) {
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    const embed = new Discord.MessageEmbed()
        .setColor('#00ffff')
        .setTimestamp()
        .setFooter(`Invite Link for ${client.config.NAME}`)
        .addField('Invite link:', `[Here](${client.config.INVLINK}) | Thanks for inviting ${client.config.NAME}!`)
    message.channel.send({ embeds: [embed] })
}
