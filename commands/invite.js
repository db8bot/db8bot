const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite Link for db8bot'),
    async execute(interaction) {
        interaction.client.logger.log('info', `invite command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const embed = new Discord.MessageEmbed()
            .setColor('#00ffff')
            .setTimestamp()
            .setFooter(`Invite Link for ${interaction.client.config.name}`)
            .addField('Invite link:', `[Here](${interaction.client.config.invLink}) | Thanks for inviting ${interaction.client.config.name}!`)
        interaction.reply({ embeds: [embed] })
    }
}
