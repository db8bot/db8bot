const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/agambenQuotes.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agamben')
        .setDescription('Quote by Giorgio Agamben'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction, '#add8e6')
    }
}
