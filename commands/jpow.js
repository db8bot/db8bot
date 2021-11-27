const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/jpowQuotes.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jpow')
        .setDescription('Quote by Jerome Powell'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction, '#85bb65')
    }
}
