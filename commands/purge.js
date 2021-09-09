const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purge some messages')
        .addIntegerOption(option =>
            option.setName(`messages`)
                .setDescription(`Number of messages to purge`)
        ),
    async execute(interaction) {
        interaction.client.logger.log('info', `purge command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const config = interaction.client.config
        if (interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.MANAGE_MESSAGES) || interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) || interaction.user.id === config.owner || interaction.user.id === "688926801824841783") {
            interaction.guild.channel.bulkDelete(parseInt(args.join(' ')) + 1).catch(err => message.reply("Bots can only purge messages that are less than 14 days old. This error could be caused by DiscordAPI Overload"))
        } else if ((message.channel.id === "696394786038480926" || message.channel.id === "690318815996805204" || message.channel.id === "685647088842833932") && message.guild.id === "685646226942984206") {
            message.channel.bulkDelete(parseInt(args.join(' ')) + 1).catch(err => message.reply("Bots can only purge messages that are less than 14 days old. This error could be caused by DiscordAPI Overload"))
        }
        else {
            message.reply('Insufficant Permissions').catch(console.error)
        }
    }
}
