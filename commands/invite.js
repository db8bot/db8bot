const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite Link for db8bot'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const embed = new Discord.MessageEmbed()
            .setColor('#00ffff')
            .setTimestamp()
            .setFooter(`Invite Link for ${process.env.NAME}`)
            .addField('Invite link:', `[Here](${process.env.INVLINK}) | Thanks for inviting ${process.env.NAME}!`)
        interaction.reply({ embeds: [embed] })
    }
}
