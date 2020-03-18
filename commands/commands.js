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
        .addField(`:tools: **General**`, `commands, help, embed, feedback, invite, ping, say, serverinv`, true)
        .addField(`:hammer: **Moderation**`, `lockdown (lockdown unlock), mute & unmute(mute role required)`, true)
        .addField(`:information_source: **Information**`, `botinfo, serverinfo, userinfo`, true)
        .addField(`:trophy: **Debate**`, `get, cut, startround: startspeech, stop`, true)

        message.channel.send({ embed: embedNew })

}