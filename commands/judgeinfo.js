const { SlashCommandBuilder } = require('@discordjs/builders')
const superagent = require('superagent')
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('judgeinfo')
        .setDescription('Look up a judge\'s paradigm on Tabroom.com'),
    async execute(interaction) {
        interaction.client.logger.log('info', `judgeinfo command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const config = interaction.client.loggerconfig
    }
}
