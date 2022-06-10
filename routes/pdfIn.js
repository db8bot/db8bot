const express = require('express')
const router = express.Router()
const Discord = require('discord.js')

router.post('/', async (req, res) => {
    const client = res.app.get('client')

    // respond 200 ok
    res.sendStatus(200)

    // notify user
    var sendGuild = await client.guilds.fetch(req.body.guildID)
    if (sendGuild.available) {
        var guildChannels = await sendGuild.channels.fetch(req.body.channelID)
        try {
            guildChannels.send({
                content: `<@${req.body.reqUser}>'s request for ${req.body.link}`,
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
})

module.exports = router
