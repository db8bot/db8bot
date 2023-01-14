const Discord = require('discord.js')
module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('information about the current server')
        .setDMPermission(false),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        // ensure interaction is in server only
        if (!interaction.inGuild()) return interaction.reply('This command must be executed from a server!')
        // channel information:
        const channelSize = interaction.guild.channels.channelCountWithoutThreads
        const channelClassifications = interaction.guild.channels.cache.map(channel => channel.type).reduce(function (acc, curr) {
            // eslint-disable-next-line no-return-assign, no-sequences
            return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
        }, {})
        const channelTypes = {
            text: ('' + channelClassifications[0]) || 0,
            voice: ('' + channelClassifications[2]) || 0,
            category: ('' + channelClassifications[4]) || 0
        }
        const memberCount = interaction.guild.memberCount

        const owner = await interaction.guild.fetchOwner()

        const embed = new Discord.EmbedBuilder()
            .setColor(owner.displayHexColor)
            .setTitle(interaction.guild.name + ' Server Stats')
            .addFields(

                {
                    name: '📄 Channels',
                    value:
                        `Category Channels: ${channelTypes.category} (${Math.round((channelTypes.category / channelSize) * 100)}%)\nText Channels: ${channelTypes.text} (${Math.round((channelTypes.text / channelSize) * 100)}%)\nVoice Channels: ${channelTypes.voice} (${Math.round((channelTypes.voice / channelSize) * 100)}%)\nTotal Channels: ${channelSize}`,
                    inline: true
                },

                {
                    name: ':man: Members',
                    value: `Total Members: ${memberCount}`,
                    inline: true
                },
                { name: ':date: Guild Created At', value: '' + interaction.guild.createdAt, inline: true },
                { name: ':keyboard: AFK Channel ID ', value: interaction.guild.afkChannelId === null ? 'None Set' : interaction.guild.afkChannelID, inline: true },
                { name: ':keyboard: AFK Channel Timeout', value: interaction.guild.afkTimeout + ' seconds', inline: true },
                { name: ':frame_photo: Server Icon', value: interaction.channel.guild.iconURL() === null ? 'Default Icon' : interaction.channel.guild.iconURL(), inline: true },
                { name: ':id: Guild ID', value: interaction.guild.id, inline: true },
                { name: ':man_in_tuxedo: Server Owner', value: `<@${owner.id}> (ID: ${owner.id})`, inline: true },
                { name: ':closed_lock_with_key: Server Verification Level | MFA Level', value: interaction.guild.verificationLevel + ' | ' + interaction.guild.mfaLevel, inline: true },
                { name: ':joystick: Roles Size', value: '' + interaction.guild.roles.cache.size, inline: true }
            )
            .setFooter({ text: `ID: ${interaction.guild.id} | Created by: ${owner.displayName}` })
        interaction.reply({ embeds: [embed] })
    }
}
