const Discord = require('discord.js')

exports.run = function (client, message, args) {
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    const embed = new Discord.MessageEmbed()
        .setColor('#00ffff')
        .setTimestamp()
        .setFooter(`Invite Link for ${process.env.NAME}`)
        .addField('Invite link:', `[Here](${process.env.INVLINK}) | Thanks for inviting ${process.env.NAME}!`)
    message.channel.send({ embeds: [embed] })
}
