const quotes = require('../quoteFiles/quotesBaudrillard.json')

exports.run = function (client, message) {
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    require('../modules/legacyQuote').sendQuote(quotes, message, '#ffff00')
}
