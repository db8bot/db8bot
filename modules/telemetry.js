const Analytics = require('analytics')
const googleAnalyticsPlugin = require('@analytics/google-analytics')
const customerIOPlugin = require('@analytics/customerio')
// G-SD9E84PXX6
function logTememetry(filename, interaction) {
    const analytics = Analytics({
        app: 'db8bot',
        version: 100,
        plugins: [
            googleAnalyticsPlugin({
                trackingId: 'UA-121991291',
            }),
            customerIOPlugin({
                siteId: '123-xyz'
            })
        ]
    })

}

module.exports = {
    telemetry: logTememetry
}
