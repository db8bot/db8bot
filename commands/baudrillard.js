const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/quotesBaudrillard.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('baudrillard')
        .setDescription('Quote by Jean Baudrillard'),
    async execute(interaction) {
        require('../telemetry').telemetry(__filename, interaction)

        require('../modules/quote').sendQuote(quotes, interaction, '#ffff00')
    }
}
