const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('mute')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('use to mute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('description for the mute')
                .setRequired(true)
        ),
    async execute(interaction) {
        interaction.client.logger.log('info', `mute command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        var user = interaction.options.getUser('user')
        var reason = interaction.options.getString('reason')
        const muteRole = interaction.guild.roles.cache.find(val => val.name === 'Mute')
        if (!muteRole) return interaction.reply('Mute Role required')
        interaction.guild.members.fetch(interaction.client.user.id).then(member => {
            if (!member.permissions.has(Discord.Permissions.FLAGS.MANAGE_ROLES)) return interaction.reply('Bot has insufficant Perms').catch(console.error)
        })
        if (user === interaction.user) return interaction.reply('You cannot mute yourself')
        interaction.guild.members.fetch(user.id).then(member => {
            member.roles.add(muteRole).catch(err => console.error(err))
        })
        const embed = new Discord.MessageEmbed()
            .setColor('#ffbf00')
            .setTimestamp()
            .setThumbnail(user.avatarURL)
            .addField('Action:', 'Mute')
            .addField('User:', user.username + '#' + user.discriminator)
            .addField('User ID:', user.id)
            .addField('Moderator:', interaction.user.username + '#' + interaction.user.discriminator)
            .addField('Reason:', reason)
            .addField('Server:', interaction.guild.name)

        const embed1 = new Discord.MessageEmbed()
            .setColor('#ffbf00')
            .setTimestamp()
            .setThumbnail(user.avatarURL)
            .addField('Action:', 'Mute')
            .addField('User:', user.username + '#' + user.discriminator)
            .addField('User ID:', user.id)
            .addField('Moderator:', interaction.user.username + '#' + interaction.user.discriminator)
            .addField('Reason:', reason)

        interaction.reply({ embeds: [embed1] })
        user.send({ embeds: [embed] })
        try {
            interaction.guild.channels.cache.find(val1 => val1.name === 'modlog').send({ embeds: [embed1] })
        } catch (e) {
            console.error(e)
        }
    }
}
