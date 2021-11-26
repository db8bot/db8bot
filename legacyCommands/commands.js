exports.run = function (client, message) {
    const Discord = require('discord.js')
    const config = client.config
    const embedNew = new Discord.MessageEmbed()
        .setColor('36393E') // change the color!
        .setTitle('DB8Bot Commands\n\n')
        .setDescription(`**Prefix:** **${config.PREFIX}**`)
        .setFooter(`${config.NAME} Commands`)
        .setTimestamp()
        .setTitle(`Please use the prefix "${config.PREFIX}" in front of all commands!`)
        .addField(':tools: **General**', 'commands, help, feedback, invite, ping, say, serverinv, clean', true)
        .addField(':hammer: **Moderation**', 'lockdown (lockdown unlock), mute & unmute(mute role required), purge', true)
        .addField(':information_source: **Information**', 'botinfo, serverinfo', true)
        .addField(':trophy: **Debate**', 'get, **startround: setspeech, endround, roundstatus, flip**, judgeinfo, speeches', true)
        .addField(':partying_face: **Fun**', 'communism, capitalism, jpow, yellen, trump, biden, amash, baudrillard, bataille, agamben, foucault', true)

    message.channel.send({ embeds: [embedNew] })
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
}
