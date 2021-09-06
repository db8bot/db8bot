const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('debatehelp')
        .setDescription('Show Help for Debate Commands'),
    async execute(interaction) {
        interaction.client.logger.log('info', `debatehelp command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const select = getRandomIntInclusive(1, 3)
        const embed = new Discord.MessageEmbed()
            .setColor(select === 1 ? '#ccff00' : select === 2 ? '#0072bb' : select === 3 ? '#ff4f00' : '#ccff00')
            .setTitle('DB8Bot Debate Function Help\n')
            .addField('Start a round', 'Use the startround command')
            .addField('Move a round forward', 'Set the current speech using the setspeech command. For available use the speeches command')
            .addField('Check a round\'s status', 'Use the roundstatus command. Rounds are identified by the name assigned at the start of the round.')
            .addField('Flip a coin for PF', 'Use the flip command')
        interaction.reply({ embeds: [embed] })
    }
}
