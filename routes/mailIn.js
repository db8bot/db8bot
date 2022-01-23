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

    async function notifyServer(searchStrRes, content) {
        var notifyArr = searchStrRes.notify
        for (const server of notifyArr) {
            var sendGuild = await client.guilds.fetch(server.server)
            if (sendGuild.available) {
                var guildChannels = await sendGuild.channels.fetch(server.channel)
                try {
                    var tagging = server.users.map(user => `<@${user}>`).join(', ') + '\n' + (server.role !== null ? `<@&${server.role}>` : '')
                    const embed = new Discord.MessageEmbed()
                        .setTitle(`${content.title} Pairings`)
                        .setColor('#daeaf1')
                    if (content.bye) { // if is bye
                        embed.addField('Competition', content.competition)
                    } else {
                        embed.addField('Competition', content.competition)
                        embed.addField('Judging', content.judging)
                        embed.addField('Start Time', content.start)
                        embed.addField('Room', content.room)
                        embed.addField('Extra Info', content.extraInfo)
                    }
                    guildChannels.send({ content: tagging, embeds: [embed] })
                } catch (err) {
                    console.error(err)
                }
            }
        }
    }

    async function messageProcessing(event, msg) {
        if (event === 'cx') {
            var competition = msg.substring(0, msg.toLowerCase().indexOf('judging:')).replace(/\n/gmi, ' ').replace(/\r/gmi, ' ').replace(/\t/g, ' ').trim() // tabromm doesnt use \r whereas gmail does. the \r replace is for when its from gmail (testing), \n is for prod
            console.log(competition)

            var searchString
            if (competition.toLowerCase().includes('(flip)')) { // if it is a flip - meaning it is prob an elim rd
                searchString = competition.toLowerCase().replace('(flip)', '').split('vs.')
                searchString = [searchString[0].trim(), searchString[1].trim()]
            } else {
                searchString = competition.toLowerCase().split('vs.')
                searchString.forEach((x, index) => {
                    // this is only for policy as of now. pf prob says pro/con. also flip for sides may come before [0]
                    if (x.trim().substring(0, 3) === 'Aff') {
                        searchString[index] = x.replace('Aff', '').trim()
                    } else if (x.trim().substring(0, 3) === 'Neg') {
                        searchString[index] = x.replace('Neg', '').trim()
                    }
                })
                console.log(searchString)
            }

            var judging = msg.substring(msg.toLowerCase().indexOf('judging:'), msg.search(/start ([0-9]|[0-9][0-9]):[0-9][0-9] (a|p)/gmi)).replace(/\n/gmi, '  ').replace(/\r/gmi, ' ').trim().split('  ').join(', ') // replace \n with 2 spaces so that we can still .trim() for spaces at the end but also identify where 2 judges are separated.
            var start = msg.substring(msg.search(/start ([0-9]|[0-9][0-9]):[0-9][0-9] (a|p)/gmi), msg.toLowerCase().indexOf('room: ')).toLowerCase().replace('p', 'pm').replace('a', 'am').trim()

            var room
            if (msg.toLowerCase().includes('message:')) {
                room = msg.match(/(?<=room:)[\s\S]*(?=message:)/gmi)[0].replace(/\n/gmi, '').replace(/\r/gmi, ' ').trim()
            } else {
                room = msg.match(/(?<=room:)[\s\S]*(?=\n)/gmi)[0].replace(/\n/gmi, '').replace(/\r/gmi, ' ').trim()
            }
            var extraInfo = msg.substring((msg.indexOf(room) + room.length))
            return ({
                competition: competition,
                searchString: searchString,
                judging: judging,
                start: start,
                room: room,
                extraInfo: extraInfo
            })
        } else if (event === 'pf') {
        }
    }

    // check if sender is blasts@www.tabroom.com OR live@tabroom.com - correct email address needs to be confirmed during testing so we will use both for now
    // check title containes "round"
    // eslint-disable-next-line no-control-regex
    var sender = req.body.from.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gmi)[0]
    var title = req.body.subject
    console.log(sender)
    console.log(title.toLowerCase())

    if ((sender === 'blasts@www.tabroom.com' || sender === 'yfang@thecollegepreparatoryschool.org') && (!title.toLowerCase().includes('tabroom update') && !title.toLowerCase().includes('message from tab'))) {
        var dbClient = await database.connect()
        var collection = dbClient.db('db8bot').collection('tabroomLiveUpdates')

        var receiveDate = new Date(req.body.headers.match(/Date: .+?(?=\n)/gmi)[0].trim().replace('Date: ', ''))
        var msg = req.body.text

        if (!(req.body.text.split('\n').length < 2) && !(req.body.text.includes('BYE'))) { // if it is not a bye - process the message
            console.log(msg)

        }
        // todo: else if, make request to tourninfo. get event and call messageProcessing with specific event
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

        if (searchStr0Res.length > 0) {
            // find server, find channel, send message
            console.log(`${searchString[0]} found in db`)

            notifyServer(searchStr0Res[0], { msg: msg || req.body.text, competition: competition, title: title, judging: judging, start: start, room: room, extraInfo: extraInfo, bye: (req.body.text.split('\n').length < 2 && req.body.text.includes('BYE')) })
        }
        if (searchStr1Res.length > 0) {
            console.log(`${searchString[1]} found in db`)

            notifyServer(searchStr1Res[0], { msg: msg || req.body.text, competition: competition, title: title, judging: judging, start: start, room: room, extraInfo: extraInfo, bye: (req.body.text.split('\n').length < 2 && req.body.text.includes('BYE')) })
        }
    }

    // mark successful receipt
    resApp.sendStatus(200)
})

module.exports = router
