const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/quotesComm.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('communism')
        .setDescription('Communism Related Quote'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction, '#dd0200')
    }
}
