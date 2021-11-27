const quotes = require('../quoteFiles/yellenQuotes.json')

exports.run = function (client, message) {
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    require('../modules/legacyQuote').sendQuote(quotes, message, '#85bb65')
}
