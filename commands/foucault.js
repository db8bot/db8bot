const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/foucaultQuote.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('foucault')
        .setDescription('Quote by Michel Foucault'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction, '#f5f5f5')
    }
}
