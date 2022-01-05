const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer()
const MongoClient = require('mongodb').MongoClient
const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`
const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
const Discord = require('discord.js')

router.post('/', upload.any(), async (req, resApp) => {
    const client = req.app.get('client')
    // check if sender is blasts@www.tabroom.com OR live@tabroom.com - correct email address needs to be confirmed during testing so we will use both for now
    // check title containes "round"
    console.log(req.body)
    var sender = req.body.from
    var title = req.body.subject
    // if ((sender === 'blasts@www.tabroom.com' || sender === 'live@tabroom.com') && (title.toLowerCase().includes('round'))) {
    var dbClient = await database.connect()
    var collection = dbClient.db('db8bot').collection('tabroomLiveUpdates')

    var receiveDate = new Date(req.body.headers.match(/Date: .+?(?=\n)/gmi)[0].trim().replace('Date: ', ''))
    var msg = req.body.text.split('\n')
    var searchString = msg[0].split('vs.')
    searchString.forEach((x, index) => {
        // this is only for policy as of now. pf prob says pro/con. also flip for sides may come before [0]
        if (x.substring(0, 3) === 'Aff') {
            console.log('in aff')
            searchString[index] = x.replace('Aff', '').trim()
        } else if (x.substring(0, 3) === 'Neg') {
            searchString[index] = x.replace('Neg', '').trim()
        }
    })
    var judging = msg[2]
    var start = msg[3].toLowerCase().replace('start', '').replace('p', 'pm').replace('a', 'am').trim()
    var room = msg[4].toLowerCase().replace('room: ', '').trim()
    var extraInfo = msg.slice(5).join('\n')

    console.log(searchString)
    var searchStr0Res = await collection.find({
        trackedTeamCode: searchString[0],
        tournStart: {
            $lte: receiveDate.getTime()
        },
        tournEnd: {
            $gte: receiveDate.getTime()
        }
    }).toArray() // [tourn start]---<email date>---[tourn end]

    var searchStr1Res = await collection.find({
        trackedTeamCode: searchString[1],
        tournStart: {
            $lte: receiveDate.getTime()
        },
        tournEnd: {
            $gte: receiveDate.getTime()
        }
    }).toArray() // [tourn start]---<email date>---[tourn end]
    console.log(searchStr0Res)
    console.log(searchStr1Res)
    if (searchStr0Res.length > 0) {
        // find server, find channel, send message
        console.log(`${searchString[0]} found in db`)
        console.log(searchStr0Res)
        notifyServer(searchStr0Res[0], { msg: msg, title: title, judging: judging, start: start, room: room, extraInfo: extraInfo })
    }
    if (searchStr1Res.length > 0) {
        console.log(`${searchString[1]} found in db`)
        console.log(searchStr1Res)
        notifyServer(searchStr1Res)
    }
    async function notifyServer(searchStrRes, content) {
        var notifyArr = searchStrRes.notify
        console.log(notifyArr)
        for (const server of notifyArr) {
            var sendGuild = await client.guilds.fetch(server.server)
            if (sendGuild.available) {
                var guildChannels = await sendGuild.channels.fetch(server.channel)
                try {
                    guildChannels.send(`${content.title}\n${content.judging}`)
                } catch (err) {
                    console.error(err)
                }
            }
        }
    }
    // }

    // mark successful receipt
    resApp.sendStatus(200)
})

module.exports = router
