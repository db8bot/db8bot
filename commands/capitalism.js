const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/quotesCap.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('capitalism')
        .setDescription('Capitalism Related Quote'),
    async execute(interaction) {
        require('../telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction, '#2c80c6')
    }
}
