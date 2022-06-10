const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('Show Bot\'s Available Commands!'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const embedNew = new Discord.MessageEmbed()
            .setColor('36393E') // change the color!
            .setTitle('db8bot Commands\n\n')
            .setDescription('**Prefix:** `/`')
            .setFooter({ text: `${process.env.NAME} Commands` })
            .setTimestamp()
            .setTitle('Please use the prefix "/" in front of all commands!')
            .addField(':tools: **General**', 'commands, help, feedback, invite, ping, say, serverinv, clean', true)
            .addField(':hammer: **Moderation**', 'lockdown (lockdown unlock), mute & unmute(mute role required), purge', true)
            .addField(':information_source: **Information**', 'botinfo, serverinfo', true)
            .addField(':trophy: **Debate**', 'get, **startround: setspeech, endround, roundstatus, flip**, judgeinfo, speeches', true)
            .addField(':partying_face: **Fun**', 'communism, capitalism, jpow, yellen, trump, biden, amash, baudrillard, bataille, agamben, foucault', true)

        interaction.reply({ embeds: [embedNew] })
    }
}
