const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Quote from a philosopher/politician')
        .addSubcommand(subcommand =>
            subcommand
                .setName('agamben')
                .setDescription('Quote by Giorgio Agamben'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('amash')
                .setDescription('Quote by Justin Amash'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('jpow')
                .setDescription('Quote by Jerome Powell'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('bataille')
                .setDescription('Quote by Georges Bataille'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('foucault')
                .setDescription('Quote by Michel Foucault'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('baudrillard')
                .setDescription('Quote by Jean Baudrillard'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('biden')
                .setDescription('Quote by Joe Biden'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('yellen')
                .setDescription('Quote by Janet Yellen'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('capitalism')
                .setDescription('Quote capitalism'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('communism')
                .setDescription('Quote communism')),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        let quotes
        switch (interaction.options.getSubcommand()) {
        case 'agamben':
            quotes = require('../quoteFiles/agambenQuotes.json')
            require('../modules/quote').sendQuote(quotes, interaction, '#add8e6')
            break
        case 'amash':
            quotes = require('../quoteFiles/amashQuotes.json')
            require('../modules/quote').sendQuote(quotes, interaction, '#f9d334')
            break
        case 'jpow':
            quotes = require('../quoteFiles/jpowQuotes.json')
            require('../modules/quote').sendQuote(quotes, interaction, '#85bb65')
            break
        case 'bataille':
            quotes = require('../quoteFiles/batailleQuotes.json')
            require('../modules/quote').sendQuote(quotes, interaction, '#800080')
            break
        case 'foucault':
            quotes = require('../quoteFiles/foucaultQuote.json')
            require('../modules/quote').sendQuote(quotes, interaction, '#800080') // CHANGE COLOR
            break
        case 'baudrillard':
            quotes = require('../quoteFiles/baudrillardQuotes.json')
            require('../modules/quote').sendQuote(quotes, interaction, '#ffff00')
            break
        case 'biden':
            quotes = require('../quoteFiles/bidenQuotes.json')
            require('../modules/quote').sendQuote(quotes, interaction, '#0c2458')
            break
        case 'yellen':
            quotes = require('../quoteFiles/yellenQuotes.json')
            require('../modules/quote').sendQuote(quotes, interaction, '#85bb65')
            break
        case 'capitalism':
            quotes = require('../quoteFiles/capitalismQuotes.json')
            require('../modules/quote').sendQuote(quotes, interaction, '#2c80c6')
            break
        case 'communism':
            quotes = require('../quoteFiles/communismQuotes.json')
            require('../modules/quote').sendQuote(quotes, interaction, '#dd0200')
            break
        }
    }
}
