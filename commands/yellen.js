const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/yellenQuotes.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yellen')
        .setDescription('Quote by Janet Yellen'),
    async execute(interaction) {
        require('../telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction, '#85bb65')
    }
}
