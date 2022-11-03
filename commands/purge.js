const { SlashCommandBuilder } = require('discord.js')
const Discord = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purge some messages')
        .addIntegerOption(option =>
            option.setName('messages')
                .setDescription('Number of messages to purge')
                .setRequired(true)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const args = interaction.options.getInteger('messages')
        const user = await interaction.guild.members.fetch(interaction.user.id)
        if (user.permissions.has(Discord.PermissionFlagsBits.ManageMessages) || user.permissions.has(Discord.PermissionFlagsBits.Administrator) || interaction.user.id === process.env.OWNER || interaction.user.id === '688926801824841783') { // special perms for jdawg on all channels across all servers
            interaction.channel.bulkDelete(parseInt(args)).catch(() => interaction.reply('Bots can only purge messages that are less than 14 days old. This may also be due to a rate limit from Discord.'))
            interaction.reply({ content: 'Done!', ephemeral: true })
        } else {
            interaction.reply('Insufficant Permissions').catch(console.error)
        }
    }
}
