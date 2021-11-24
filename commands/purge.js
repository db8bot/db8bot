const { SlashCommandBuilder } = require('@discordjs/builders')
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
        require('../telemetry').telemetry(__filename, interaction)
        const config = interaction.client.config
        const args = interaction.options.getInteger('messages')
        if (interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.MANAGE_MESSAGES) || interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) || interaction.user.id === config.OWNER || interaction.user.id === '688926801824841783') {
            interaction.channel.bulkDelete(args + 1).catch(() => interaction.reply('Bots can only purge messages that are less than 14 days old. This error could be caused by DiscordAPI Overload'))
            interaction.reply({ content: 'Done!', ephemeral: true })
        } else if ((interaction.channelId === '696394786038480926' || interaction.channelId === '690318815996805204' || interaction.channelId === '685647088842833932') && interaction.channelId === '685646226942984206') {
            interaction.channel.bulkDelete(parseInt(args.join(' ')) + 1).catch(() => interaction.reply('Bots can only purge messages that are less than 14 days old. This error could be caused by DiscordAPI Overload'))
            interaction.reply({ content: 'Done!', ephemeral: true })
        } else {
            interaction.reply('Insufficant Permissions').catch(console.error)
        }
    }
}
