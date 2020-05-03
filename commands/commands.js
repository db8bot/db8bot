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
        .addField(`:tools: **General**`, `commands, help, embed, feedback, invite, ping, say, serverinv, dm, optout, opts`, true)
        .addField(`:hammer: **Moderation**`, `lockdown (lockdown unlock), mute & unmute(mute role required), purge, setup`, true)
        .addField(`:information_source: **Information**`, `botinfo, serverinfo, userinfo`, true)
        .addField(`:trophy: **Debate**`, `get, **startround: setspeech, endround, roundstatus, flip**, judgeinfo, speeches`, true)
        .addField(`:partying_face: **Fun**`, `communism, capitalism, trump, baudrillard, bataille`, true)

        message.channel.send({ embed: embedNew })
        client.logger.log('info', `commands command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${guild}`)
}