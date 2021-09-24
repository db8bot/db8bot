const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const ms = require('ms')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('lockdown/unlock the channel')
        .addStringOption(option =>
            option.setName('argument')
                .setDescription('amount of time to lockdown for (1m, 20s, etc) OR unlock')
                .setRequired(true)
        ),
    async execute(interaction) {
        interaction.client.logger.log('info', `lockdown command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const client = interaction.client
        const args = interaction.options.getString('argument')
        if (!interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.MANAGE_CHANNELS)) return interaction.reply('Insufficant Permissions').catch(console.error)
        if (!client.lockit) client.lockit = []
        const time = args
        const validUnlocks = ['release', 'unlock']
        if (!time.includes('unlock') && !(/\d/.test(time))) return interaction.reply('You must set a duration for the lockdown in either hours, minutes or seconds or enter unlock/release.')
        const embed = new Discord.MessageEmbed()
            .setColor('#cb4154')
            .setTimestamp()
            .setThumbnail(interaction.user.avataURL)
            .addField('Action:', 'Lockdown')
            .addField('Duration/Time:', time)
            .addField('Moderator:', interaction.user.username + '#' + interaction.user.discriminator)

        if (validUnlocks.includes(time)) {
            interaction.channel.permissionOverwrites.create(interaction.guild.id, {
                SEND_MESSAGES: null
            }).then(() => {
                interaction.reply('Lockdown lifted.')
                clearTimeout(client.lockit[interaction.channel.id])
                delete client.lockit[interaction.channel.id]
            }).catch(error => {
                console.error(error)
            })
        } else {
            interaction.channel.permissionOverwrites.create(interaction.guild.id, {
                SEND_MESSAGES: false
            }).then(() => {
                interaction.channel.permissionOverwrites.create(client.config.botid, {
                    SEND_MESSAGES: true
                }).then(() => {
                    interaction.reply(`Channel locked down for ${ms(ms(time), { long: true })}`).then(() => {
                        client.lockit[interaction.channel.id] = setTimeout(() => {
                            interaction.channel.permissionOverwrites.create(interaction.guild.id, {
                                SEND_MESSAGES: null
                            }).then(interaction.channel.send('Lockdown lifted.')).catch(console.error)
                            delete client.lockit[interaction.channel.id]
                        }, ms(time))
                    }).catch(error => {
                        console.log(error)
                    })
                })
            })
        }

        try {
            interaction.guild.channels.cache.find(val => val.name === 'modlog').send({ embeds: [embed] }).catch(err => console.error(err))
        } catch (err) {
            interaction.channel.send('No modlog')
        }
    }
}
