const express = require('express')
const router = express.Router()

router.post('/', async (req, res) => {
    const client = res.app.get('client')

    // respond 200 ok
    res.sendStatus(200)

    // notify user
    if (req.body.guildID) {
        var sendGuild = await client.guilds.fetch(req.body.guildID)
        if (sendGuild.available) {
            var guildChannels = await sendGuild.channels.fetch(req.body.channelID)
            try {
                guildChannels.send({
                    content: `<@${req.body.reqUser}>'s request for ${req.body.link}. Download the HTML file and drag into any major browser to view.`,
                    files: [
                        {
                            attachment: Buffer.from(req.body.file), name: `${req.body.guildID + req.body.reqUser + (Math.floor(Math.random() * 100) + 1)}.html`
                        }
                    ]
                })
            } catch (err) {
                console.error(err)
            }
        }
    } else { // dms - no guildID - message user
        var user = await client.users.fetch(req.body.reqUser)
        try {
            await user.send({
                content: `<@${req.body.reqUser}>'s request for ${req.body.link}. Download the HTML file and drag into any major browser to view.`,
                files: [
                    {
                        attachment: Buffer.from(req.body.file), name: `${req.body.reqUser + (Math.floor(Math.random() * 100) + 1)}.html`
                    }
                ]
            })
        } catch (err) {
            console.error(err)
        }
    }
})

module.exports = router
