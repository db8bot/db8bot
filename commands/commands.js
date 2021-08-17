exports.run = function (client, message) {
    const Discord = require('discord.js');
    const config = client.config;
    var guild = message.guild;
    const embedNew = new Discord.MessageEmbed()
        .setColor('36393E') //change the color!
        .setTitle("DB8Bot Commands\n\n")
        .setDescription(`**Prefix:** **${config.prefix}**`)
        .setFooter(`${config.name} Commands`)
        .setTimestamp()
        .setTitle(`Please use the prefix "${config.prefix}" in front of all commands!`)
        .addField(`:tools: **General**`, `commands, help, embed, feedback, invite, ping, say, serverinv, dm, optout, opts, clean`, true)
        .addField(`:hammer: **Moderation**`, `lockdown (lockdown unlock), mute & unmute(mute role required), purge, setup`, true)
        .addField(`:information_source: **Information**`, `botinfo, serverinfo`, true)
        .addField(`:trophy: **Debate**`, `get, **startround: setspeech, endround, roundstatus, flip**, judgeinfo, speeches`, true)
        .addField(`:partying_face: **Fun**`, `communism, capitalism, jpow, yellen, trump, biden, amash, baudrillard, bataille, agamben, foucault`, true)

        message.channel.send({ embeds: [embedNew] })
        client.logger.log('info', `commands command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
}