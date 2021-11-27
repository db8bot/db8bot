const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/quotesBataille.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bataille')
        .setDescription('Quote by Georges Bataille'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction, '#800080')
    }
}
