const quotes = require('../quoteFiles/agambenQuotes.json')

exports.run = function (client, message) {
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    require('../modules/legacyQuote').sendQuote(quotes, message, '#add8e6')
}
