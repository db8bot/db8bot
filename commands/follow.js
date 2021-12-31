/* eslint-disable node/handle-callback-err */
// note: make req to tabroomapi to follow a user on the tabroom.airfusion.dev account - this doesn not handle incoming email notifications

const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient
const superagent = require('superagent')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('follow')
        .setDescription('Follow a team on tabroom')
        .addStringOption(option =>
            option.setName('entry-list')
                .setDescription('tabroom.com URL of the entries page that includes the team you want to follow.') // if err later: URL should include fields.mhtml
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('team-code')
                .setDescription('The entry code for the team to follow. Must be exact, case sensitive.')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('notify-channel')
                .setDescription('Send updates to this channel. Required.')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('notify-user1')
                .setDescription('Mention user1 to be notified with updates. 5 users max. If you need more, use the role option.')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('notify-user2')
                .setDescription('Mention user2 to be notified with updates. 5 users max. If you need more, use the role option.')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('notify-user3')
                .setDescription('Mention user3 to be notified with updates. 5 users max. If you need more, use the role option.')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('notify-user4')
                .setDescription('Mention user4 to be notified with updates. 5 users max. If you need more, use the role option.')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('notify-user5')
                .setDescription('Mention user5 to be notified with updates. 5 users max. If you need more, use the role option.')
                .setRequired(false)
        )
        .addRoleOption(option =>
            option.setName('notify-role')
                .setDescription('Mention a bot accessible role to be pinged with updates. Assign the role to additional users.')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('enable-analytics')
                .setDescription('Allows user1 & user2 to use /roundinfo for analytics. Enabled by default.')
                .setRequired(false)
                .addChoice('Enabled', 'true')
                .addChoice('Disabled', 'false')
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        if (!interaction.guild) return (interaction.reply('Command not available in DMs.'))
        const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const guild = interaction.guild
        // check db for existing code
        var dbClient = await database.connect()
        var collection = dbClient.db('db8bot').collection('tabroomLiveUpdates')
        var sameCodeDBSearchRes = await collection.find({ trackedTeamCode: interaction.options.getString('team-code') }).toArray()
        if (sameCodeDBSearchRes.length > 0) { // team with same code already exists, deal accordingly later

        } else {
            // team with same code does not exist, create new entry, follow normally
            await interaction.reply('Following...')
            var payload = {
                apiauth: process.env.TABAPIKEY,
                username: process.env.TABUSERNAME,
                password: process.env.TABPASSWORD
            }
            superagent
                .post('https://debateapis.wm.r.appspot.com/login')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send(JSON.parse(JSON.stringify(payload)))
                .end((err, res) => {
                    // if (err) console.error(err)
                    var token = res.body.token
                    var followPayload = {
                        apiauth: process.env.TABAPIKEY,
                        token: token,
                        entryLink: interaction.options.getString('entry-list'), // need to be regex tested for the correct link
                        code: interaction.options.getString('team-code')
                    }
                    function follow(followPayload) {
                        return new Promise((resolve, reject) => {
                            superagent
                                .post('https://debateapis.wm.r.appspot.com/me/follow')
                                .set('Content-Type', 'application/x-www-form-urlencoded')
                                .send(JSON.parse(JSON.stringify(followPayload)))
                                .end((err, res) => {
                                    // if (err) reject(err)
                                    resolve(res.body)
                                })
                        })
                    }

                    function getTournInfo(link) {
                        return new Promise((resolve, reject) => {
                            superagent
                                .post('https://debateapis.wm.r.appspot.com/tournamentinfo')
                                .set('Content-Type', 'application/x-www-form-urlencoded')
                                .send(JSON.parse(`{"apiauth": "${process.env.TABAPIKEY}", "link": "${link}"}`))
                                .end((err, res) => {
                                    // if (err) reject(err)
                                    resolve(res.body)
                                })
                        })
                    }

                    Promise.all([follow(followPayload), getTournInfo(followPayload.entryLink)]).then((val) => {
                        var followRes = val[0]
                        var tournInfo = val[1]
                        var mongoEntry = {
                            trackedTeamCode: interaction.options.getString('team-code'),
                            tournStart: tournInfo.startDateUnix,
                            tournEnd: tournInfo.endDateUnix,
                            tournID: followRes.tourn_id,
                            tournName: tournInfo.tournName,
                            sendServer: interaction.guildId,
                            sendChannel: interaction.options.getChannel('notify-channel').id,
                            notifyUsers: [], // todo
                            notifyRole: null, // todo
                            analytics: interaction.options.getString('enable-analytics') === 'true',
                            expireAt: new Date(parseInt(tournInfo.endDateUnix))
                        }
                        console.log(mongoEntry)
                        collection.insertOne(mongoEntry, (err, res) => {
                            if (err) console.error(err)
                            console.log('inserted')
                        })
                        // add info to database
                        // return success msg
                        interaction.fetchReply()
                            .then(reply => {
                                interaction.editReply('Followed!')
                            })
                    })
                })
        }
    }
}
