const quotes = require('../quoteFiles/amashQuotes.json')

exports.run = function (client, message) {
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    require('../modules/legacyQuote').sendQuote(quotes, message, '#f9d334')
}
