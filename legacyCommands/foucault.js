const quotes = require('../quoteFiles/foucaultQuote.json')

exports.run = function (client, message) {
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    require('../modules/legacyQuote').sendQuote(quotes, message, '#f5f5f5')
}
