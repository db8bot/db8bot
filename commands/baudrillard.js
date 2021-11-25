const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/quotesBaudrillard.json')
// const translate = require('@vitalets/google-translate-api') - remove from other quote files, install as dev dep
// const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('baudrillard')
        .setDescription('Quote by Jean Baudrillard'),
    async execute(interaction) {
        require('../telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction)
    }
}
