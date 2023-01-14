const express = require('express')
const router = express.Router()
const crypto = require('crypto')

router.post('/', async (req, resApp) => {
    function hash(apiKey) {
        return crypto.createHash('sha256').update(apiKey).digest('hex')
    }
    if (hash(req.body.auth) !== process.env.BOTEXPRESSAUTH) {
        return resApp.status(401).send('Invalid API Key or no authentication provided.')
    }
    const content = {
        // first tenary operator: if server mention using member id, otherwise mention using userid in dms
        content: `<@${req.body.serverID ? req.body.memberID : req.body.dmUser}> | OCR Job: \`${req.body.jobID}\` | Execution Time: \`${Date.now() - req.body.time}ms\``,
        files: [{ attachment: Buffer.from(req.body.text), name: `${req.body.jobID}OCR.txt` }]
    }
    require('../modules/channelSend').channelSendSingleGuildSingleUser(req.app.get('client'), req.body, content)
    resApp.status(200).send('OK')
})

module.exports = router
