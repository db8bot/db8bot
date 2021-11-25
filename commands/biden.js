const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/bidenQuotes.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('biden')
        .setDescription('Quote by Joe Biden'),
    async execute(interaction) {
        require('../telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction, '#0c2458')
    }
}
