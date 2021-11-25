const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/amashQuotes.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('amash')
        .setDescription('Quote by Justin Amash'),
    async execute(interaction) {
        require('../telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction, '#f9d334')
    }
}
