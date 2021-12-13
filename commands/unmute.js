const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('unmute a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('use to mute')
                .setRequired(true)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        var user = interaction.options.getUser('user')
        const muteRole = interaction.guild.roles.cache.find(val => val.name === 'Mute')
         if (interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.MANAGE_MESSAGES) || interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) || interaction.user.id === config.OWNER){
        if (!muteRole) return interaction.reply('Mute Role required')
        if (user === interaction.user) return interaction.reply('You cannot mute yourself')
        interaction.guild.members.fetch(interaction.client.user.id).then(member => {
            if (!member.permissions.has(Discord.Permissions.FLAGS.MANAGE_ROLES)) return interaction.reply('Bot has insufficant Perms').catch(console.error)
        })
        interaction.guild.members.fetch(user).then(member => {
            if (member.roles.cache.has(muteRole.id)) {
                member.roles.remove(muteRole).catch(err => console.log(err))
            }
        })

        const embed = new Discord.MessageEmbed()
            .setColor('#00008b')
            .setTimestamp()
            .setThumbnail(user.avatarURL)
            .addField('Action:', 'UnMute')
            .addField('User:', user.username + '#' + user.discriminator)
            .addField('User ID:', user.id)
            .addField('Moderator:', interaction.user.username + '#' + interaction.user.discriminator)
            .addField('Server:', interaction.guild.name)

        const embed1 = new Discord.MessageEmbed()
            .setColor('#00008b')
            .setTimestamp()
            .setThumbnail(user.avatarURL)
            .addField('Action:', 'UnMute')
            .addField('User:', user.username + '#' + user.discriminator)
            .addField('User ID:', user.id)
            .addField('Moderator:', interaction.user.username + '#' + interaction.user.discriminator)

        interaction.reply({ embeds: [embed1] })
        user.send({ embeds: [embed] })
        try {
            interaction.guild.channels.cache.find(val1 => val1.name === 'modlog').send({ embeds: [embed1] })
        } catch (e) {
            console.error(e)
        }
       }
    }
}
