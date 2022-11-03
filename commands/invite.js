const { SlashCommandBuilder } = require('discord.js')
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite link for db8bot'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const embed = new Discord.EmbedBuilder()
            .setColor('#00ffff')
            .setTimestamp()
            .setFooter({ text: `Invite link for ${process.env.NAME}` })
            .addFields({ name: 'Invite link:', value: `[Here](${process.env.INVLINK}) | Thanks for inviting ${process.env.NAME}!` })
        interaction.reply({ embeds: [embed] })
    }
}
