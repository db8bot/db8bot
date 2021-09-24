const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('Show Bot\'s Available Commands!'),
    async execute(interaction) {
        interaction.client.logger.log('info', `commands command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const config = interaction.client.config
        const embedNew = new Discord.MessageEmbed()
            .setColor('36393E') // change the color!
            .setTitle('DB8Bot Commands\n\n')
            .setDescription(`**Prefix:** **${config.prefix}**`)
            .setFooter(`${config.name} Commands`)
            .setTimestamp()
            .setTitle(`Please use the prefix "${config.prefix}" in front of all commands!`)
            .addField(':tools: **General**', 'commands, help, feedback, invite, ping, say, serverinv, clean', true)
            .addField(':hammer: **Moderation**', 'lockdown (lockdown unlock), mute & unmute(mute role required), purge', true)
            .addField(':information_source: **Information**', 'botinfo, serverinfo', true)
            .addField(':trophy: **Debate**', 'get, **startround: setspeech, endround, roundstatus, flip**, judgeinfo, speeches', true)
            .addField(':partying_face: **Fun**', 'communism, capitalism, jpow, yellen, trump, biden, amash, baudrillard, bataille, agamben, foucault', true)

        interaction.reply({ embeds: [embedNew] })
    }
}
