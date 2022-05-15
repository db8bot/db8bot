/* eslint-disable node/handle-callback-err */
// note: make req to tabroomapi to follow a user on the tabroom.airfusion.dev account - this doesn not handle incoming email notifications

const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient
const superagent = require('superagent')
const { CloudTasksClient } = require('@google-cloud/tasks')
const taskClient = new CloudTasksClient()
const MAX_SCHEDULE_LIMIT = 30 * 60 * 60 * 24 // Represents 30 days in seconds.
const fs = require('fs').promises

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

async function createCloudTasks(followRes, tournInfo) {
    // auto-unfollow cloud function via cloud tasks
    const project = 'db8bot' // Your GCP Project id
    const queue = 'unfollowqueue' // Name of your Queue
    const location = 'us-central1' // The GCP region of your queue
    const url = 'https://us-central1-db8bot.cloudfunctions.net/unfollow' // The full url path that the request will be sent to
    const email = 'automatic-unfollow@db8bot.iam.gserviceaccount.com' // Cloud IAM service account
    const unfollowPayload = { // The task HTTP request body
        username: process.env.TABUSERNAME,
        password: process.env.TABPASSWORD,
        tabapiauth: process.env.TABAPIKEY,
        unfollowLink: followRes.unfollowLink
    }
    // write service account key to file
    await fs.writeFile('./gcloudservicekey.json', process.env.GCLOUDCFSERVICE, 'utf8')
    process.env.GOOGLE_APPLICATION_CREDENTIALS = './gcloudservicekey.json'

    // Construct the fully qualified queue name.
    const parent = taskClient.queuePath(project, location, queue)

    // Convert message to buffer.
    const body = Buffer.from(JSON.stringify(unfollowPayload)).toString('base64')

    const task = {
        httpRequest: {
            httpMethod: 'POST',
            url,
            oidcToken: {
                serviceAccountEmail: email
            },
            headers: {
                'Content-Type': 'text/plain'
            },
            body
        }
    }

    const convertedDate = new Date(parseInt(tournInfo.endDateUnix))
    const currentDate = new Date()

    // Schedule time can not be in the past.
    if (convertedDate < currentDate) {
        console.error('Scheduled date in the past.')
    } else if (convertedDate > currentDate) {
        const dateDiffInSeconds = (convertedDate - currentDate) / 1000
        // Restrict schedule time to the 30 day maximum.
        if (dateDiffInSeconds > MAX_SCHEDULE_LIMIT) {
            console.error('Schedule time is over 30 day maximum.')
        }
        // Construct future date in Unix time.
        const dateInSeconds =
            Math.min(dateDiffInSeconds, MAX_SCHEDULE_LIMIT) + Date.now() / 1000
        // Add schedule time to request in Unix time using Timestamp structure.
        // https://googleapis.dev/nodejs/tasks/latest/google.protobuf.html#.Timestamp
        task.scheduleTime = {
            seconds: dateInSeconds
        }
    }

    try {
        // Send create task request.
        const [response] = await taskClient.createTask({ parent, task })
        console.log(`Created task ${response.name}`)
    } catch (error) {
        // Construct error for Stackdriver Error Reporting
        console.error(Error(error.message))
    }
}

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
                .addChoices({ name: 'Enabled', value: 'true' }, { name: 'Disabled', value: 'false' })
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        if (!interaction.guild) return (interaction.reply('Command not available in DMs.'))
        if (!(/https:\/\/www.tabroom.com\/index.tourn\/fields.mhtml\?tourn_id=[0-9]+&event_id=[0-9]+/gi.test(interaction.options.getString('entry-list')))) { // test for valid tabroom url, if false enters the if
            interaction.reply('Invalid tabroom.com URL. Please try again. URL should include fields.mhtml and look like this `https://www.tabroom.com/index/tourn/fields.mhtml?tourn_id=[some numbers]&event_id=[some numbers]`')
            return
        }
        const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        var usersToNotify = [interaction.options.getUser('notify-user1'), interaction.options.getUser('notify-user2'), interaction.options.getUser('notify-user3'), interaction.options.getUser('notify-user4'), interaction.options.getUser('notify-user5')].filter(user => user)
        usersToNotify = usersToNotify.map(user => user.id)
        // check db for existing code
        var dbClient = await database.connect()
        var collection = dbClient.db('db8bot').collection('tabroomLiveUpdates')
        var sameCodeDBSearchRes = await collection.find({ trackedTeamCode: interaction.options.getString('team-code') }).toArray()
        if (sameCodeDBSearchRes.length > 0) { // team with same code already exists
            // db search for same team, same tournament - in these cases: new server wants to follow same team at same tournament
            var sameTeamDBSearchRes = await collection.find({
                trackedTeamCode: interaction.options.getString('team-code'),
                tournID: interaction.options.getString('entry-list').match(/tourn_id=(\d+)/g)[0].replace('tourn_id=', '')
            }).toArray() // there should only be 1 entry of a particular team (name) at 1 tournament
            sameTeamDBSearchRes = sameTeamDBSearchRes[0]
            if (sameTeamDBSearchRes) { // if there are results ^
                var existingNotifiedServers = sameTeamDBSearchRes.notify
                existingNotifiedServers = existingNotifiedServers.map(target => target.server) // ids of all servers following this team
                if (!existingNotifiedServers.includes(interaction.guildId)) { // if inputted server is not currently following this team, add this server's details to the following team's db entry
                    var serverDetails = {
                        server: interaction.guildId,
                        channel: interaction.options.getChannel('notify-channel').id,
                        users: usersToNotify.length > 0 ? usersToNotify : null,
                        role: interaction.options.getRole('notify-role') ? interaction.options.getRole('notify-role').id : null,
                        analytics: interaction.options.getString('enable-analytics') === 'true'
                    }
                    collection.updateOne({
                        trackedTeamCode: interaction.options.getString('team-code'),
                        tournID: interaction.options.getString('entry-list').match(/tourn_id=(\d+)/g)[0].replace('tourn_id=', '')
                    }, {
                        $push: { notify: serverDetails }
                    })
                    // followed! send confirmation
                    const existingFollowEmbed = new Discord.MessageEmbed()
                        .setColor('#016f94')
                        .setTitle(`Following ${interaction.options.getString('team-code')}`)
                        .addField('Event', sameTeamDBSearchRes.event, true)
                        .addField('Tournament', sameTeamDBSearchRes.tournName, true)
                        .addField('Start', new Date(sameTeamDBSearchRes.tournStart).toString(), true)
                        .addField('End', new Date(sameTeamDBSearchRes.tournEnd).toString(), true)
                        .addField('Notify Channel', `#${interaction.options.getChannel('notify-channel').name}`, true)
                        .addField('Notify Role', interaction.options.getRole('notify-role') ? `@${interaction.options.getRole('notify-role').name}` : 'No notify role specified.', true)
                        .addField('Notify Users', usersToNotify.map(user => `<@${user}>`).join(', '), true)
                        .addField('Analytics', interaction.options.getString('enable-analytics') === 'true' ? 'Enabled' : 'Disabled', true)
                        .addField('Follow Expires', new Date(sameTeamDBSearchRes.tournEnd).toString(), true)
                    interaction.reply({ embeds: [existingFollowEmbed] })
                } else { // if inputted server is already following this team, do nothing
                    interaction.reply('You or this server are/is already following this team.')
                }
            } else { // not the same tournament. the inputted tournament is different from the ones in the db but has the same team code as one entry in the db. Check if start/end time is different, if different (doesn't sit in existing date ranges), allow. If same (or sits in between existing date ranges), disallow.
                // get the inputted tournament's start/end time
                var inputtedTournamentInfo = await getTournInfo(interaction.options.getString('entry-list'))
                for (let i = 0; i < sameCodeDBSearchRes.length; i++) { // use sameCodeDBSearchRes for all db entries with same team code with different dates.
                    // check that new date is not equal or between existing start and end dates. if equal or between, break and return error.

                    // conditions to check, if true, terminate & error
                    var betweenExistingRange = (inputtedTournamentInfo.startDateUnix >= sameCodeDBSearchRes[i].tournStart && inputtedTournamentInfo.endDateUnix <= sameCodeDBSearchRes[i].tournEnd) // inputted tournament sits right between start/end of existing tournament [existing start]-----<inputted start>--------<inputted end>-------[existing end]
                    var endsInRange = (inputtedTournamentInfo.startDateUnix <= sameCodeDBSearchRes[i].tournStart && inputtedTournamentInfo.endDateUnix <= sameCodeDBSearchRes[i].tournEnd) // inputted tourn starts outside of existing start but ends between existing start & existing end <inputted start>----[existing start]-------<inputted end>------[existing end]
                    var startsInRange = (inputtedTournamentInfo.startDateUnix >= sameCodeDBSearchRes[i].tournStart && inputtedTournamentInfo.endDateUnix >= sameCodeDBSearchRes[i].tournEnd) // [existing start]------<inputted start>-----[existing end]----<inputted end>
                    var includesExistingRange = (inputtedTournamentInfo.startDateUnix <= sameCodeDBSearchRes[i].tournStart && inputtedTournamentInfo.endDateUnix >= sameCodeDBSearchRes[i].tournEnd) // <inputted start>------[existing start]------[existing end]-------<inputted end>
                    if ((betweenExistingRange) || (endsInRange) || (startsInRange) || (includesExistingRange)) { // if any of these are true, break and return err
                        interaction.reply('Error! tl;dr: db8bot doesn not support following a person/team that is double entered at 1 or more tournaments at the same time.\ndb8bot does not support following a team at a different tournament with the same team code and tournament start/end date as a team that is currently being followed.')
                        return
                    }
                }
                // passed all timing checks, meaning it is a diff tournament with different non overlapping dates in which the same team code (as a previous tournament already in db) is used. Allow entry into db

                // @TODO Sort out the copy-pasted code - pull into functions.
                await interaction.reply(`Following... Track the operation progress below:\n- Authenticating with Tabroom.com\n- Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n- Requesting tournament information from Tabroom.com\n- Adding to database\n- Scheduling automatic unfollow on tournament end date`)
                var authPayload = {
                    apiauth: process.env.TABAPIKEY,
                    username: process.env.TABUSERNAME,
                    password: process.env.TABPASSWORD
                }
                superagent
                    .post('https://debateapis.wm.r.appspot.com/login')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send(JSON.parse(JSON.stringify(authPayload)))
                    .end(async (err, res) => {
                        if (err) console.error(err)
                        interaction.fetchReply()
                            .then(reply => {
                                interaction.editReply(`Following... Track the operation progress below:\n:white_check_mark: Authenticating with Tabroom.com\n- Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n- Requesting tournament information from Tabroom.com\n- Adding to database\n- Scheduling automatic unfollow on tournament end date`)
                            })
                        var token = res.body.token
                        var followPayload = {
                            apiauth: process.env.TABAPIKEY,
                            token: token,
                            entryLink: interaction.options.getString('entry-list'),
                            code: interaction.options.getString('team-code')
                        }
                        var followRes = await follow(followPayload)
                        interaction.fetchReply()
                            .then(reply => {
                                interaction.editReply(`Following... Track the operation progress below:\n:white_check_mark: Authenticating with Tabroom.com\n:white_check_mark: Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n- Requesting tournament information from Tabroom.com\n- Adding to database\n- Scheduling automatic unfollow on tournament end date`)
                            })
                        var tournInfo = inputtedTournamentInfo
                        interaction.fetchReply()
                            .then(reply => {
                                interaction.editReply(`Following... Track the operation progress below:\n:white_check_mark: Authenticating with Tabroom.com\n:white_check_mark: Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n:white_check_mark: Requesting tournament information from Tabroom.com\n- Adding to database\n- Scheduling automatic unfollow on tournament end date`)
                            })
                        var mongoEntry = {
                            trackedTeamCode: interaction.options.getString('team-code'),
                            tournStart: tournInfo.startDateUnix,
                            tournEnd: tournInfo.endDateUnix,
                            tournID: followRes.tourn_id,
                            tournName: tournInfo.tournName,
                            notify: [{
                                server: interaction.guildId,
                                channel: interaction.options.getChannel('notify-channel').id,
                                users: usersToNotify.length > 0 ? usersToNotify : null,
                                role: interaction.options.getRole('notify-role') ? interaction.options.getRole('notify-role').id : null,
                                analytics: interaction.options.getString('enable-analytics') === 'true'
                            }],
                            event: 'null',
                            expireAt: new Date(parseInt(tournInfo.endDateUnix))
                        }
                        collection.insertOne(mongoEntry, (err, res) => {
                            if (err) console.error(err)
                        })
                        interaction.fetchReply()
                            .then(reply => {
                                interaction.editReply(`Following... Track the operation progress below:\n:white_check_mark: Authenticating with Tabroom.com\n:white_check_mark: Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n:white_check_mark: Requesting tournament information from Tabroom.com\n:white_check_mark: Adding to database\n- Scheduling automatic unfollow on tournament end date`)
                            })
                        await createCloudTasks(followRes, tournInfo) // create cloud tasks for auto-unfollow
                        interaction.fetchReply()
                            .then(reply => {
                                interaction.editReply(`Following... Track the operation progress below:\n:white_check_mark: Authenticating with Tabroom.com\n:white_check_mark: Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n:white_check_mark: Requesting tournament information from Tabroom.com\n:white_check_mark: Adding to database\n:white_check_mark: Scheduling automatic unfollow on tournament end date`)
                            })
                        interaction.fetchReply()
                            .then(reply => {
                                const followEmbed = new Discord.MessageEmbed()
                                    .setColor('#016f94')
                                    .setTitle(`Following ${interaction.options.getString('team-code')}`)
                                    .addField('Event', mongoEntry.event, true)
                                    .addField('Tournament', mongoEntry.tournName, true)
                                    .addField('Start', new Date(mongoEntry.tournStart).toString(), true)
                                    .addField('End', new Date(mongoEntry.tournEnd).toString(), true)
                                    .addField('Notify Channel', `#${interaction.options.getChannel('notify-channel').name}`, true)
                                    .addField('Notify Role', interaction.options.getRole('notify-role') ? `<@&${interaction.options.getRole('notify-role').name}>` : 'No notify role specified.', true)
                                    .addField('Notify Users', usersToNotify.map(user => `<@${user}>`).join(', '), true)
                                    .addField('Analytics', interaction.options.getString('enable-analytics') === 'true' ? 'Enabled' : 'Disabled', true)
                                    .addField('Follow Expires', new Date(mongoEntry.tournEnd).toString(), true)
                                interaction.editReply({ embeds: [followEmbed] })
                            })
                    })
            }
        } else {
            // team with same code does not exist, create new entry, follow normally
            await interaction.reply(`Following... Track the operation progress below:\n- Authenticating with Tabroom.com\n- Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n- Requesting tournament information from Tabroom.com\n- Adding to database\n- Scheduling automatic unfollow on tournament end date`)
            var authPayload = {
                apiauth: process.env.TABAPIKEY,
                username: process.env.TABUSERNAME,
                password: process.env.TABPASSWORD
            }
            superagent
                .post('https://debateapis.wm.r.appspot.com/login')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send(JSON.parse(JSON.stringify(authPayload)))
                .end((err, res) => {
                    if (err) console.error(err)
                    interaction.fetchReply()
                        .then(reply => {
                            interaction.editReply(`Following... Track the operation progress below:\n:white_check_mark: Authenticating with Tabroom.com\n- Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n- Requesting tournament information from Tabroom.com\n- Adding to database\n- Scheduling automatic unfollow on tournament end date`)
                        })
                    var token = res.body.token
                    var followPayload = {
                        apiauth: process.env.TABAPIKEY,
                        token: token,
                        entryLink: interaction.options.getString('entry-list'), // need to be regex tested for the correct link
                        code: interaction.options.getString('team-code')
                    }

                    Promise.all([follow(followPayload), getTournInfo(followPayload.entryLink)]).then(async (val) => {
                        interaction.editReply(`Following... Track the operation progress below:\n:white_check_mark: Authenticating with Tabroom.com\n:white_check_mark: Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n:white_check_mark: Requesting tournament information from Tabroom.com\n- Adding to database\n- Scheduling automatic unfollow on tournament end date`)
                        var followRes = val[0]
                        var tournInfo = val[1]
                        var mongoEntry = {
                            trackedTeamCode: interaction.options.getString('team-code'),
                            tournStart: tournInfo.startDateUnix,
                            tournEnd: tournInfo.endDateUnix,
                            tournID: followRes.tourn_id,
                            tournName: tournInfo.tournName,
                            notify: [{
                                server: interaction.guildId,
                                channel: interaction.options.getChannel('notify-channel').id,
                                users: usersToNotify.length > 0 ? usersToNotify : null,
                                role: interaction.options.getRole('notify-role') ? interaction.options.getRole('notify-role').id : null,
                                analytics: interaction.options.getString('enable-analytics') === 'true'
                            }],
                            event: 'null', // this will change later once pf is implemented
                            expireAt: new Date(parseInt(tournInfo.endDateUnix))
                        }
                        collection.insertOne(mongoEntry, (err, res) => {
                            if (err) console.error(err)
                        })
                        interaction.editReply(`Following... Track the operation progress below:\n:white_check_mark: Authenticating with Tabroom.com\n:white_check_mark: Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n:white_check_mark: Requesting tournament information from Tabroom.com\n:white_check_mark: Adding to database\n- Scheduling automatic unfollow on tournament end date`)

                        await createCloudTasks(followRes, tournInfo) // create cloud tasks for auto-unfollow

                        interaction.editReply(`Following... Track the operation progress below:\n:white_check_mark: Authenticating with Tabroom.com\n:white_check_mark: Requesting Tabroom.com to follow ${interaction.options.getString('team-code')}\n:white_check_mark: Requesting tournament information from Tabroom.com\n:white_check_mark: Adding to database\n:white_check_mark: Scheduling automatic unfollow on tournament end date`)

                        interaction.fetchReply()
                            .then(reply => {
                                const followEmbed = new Discord.MessageEmbed()
                                    .setColor('#016f94')
                                    .setTitle(`Following ${interaction.options.getString('team-code')}`)
                                    .addField('Event', mongoEntry.event, true)
                                    .addField('Tournament', mongoEntry.tournName, true)
                                    .addField('Start', new Date(mongoEntry.tournStart).toString(), true)
                                    .addField('End', new Date(mongoEntry.tournEnd).toString(), true)
                                    .addField('Notify Channel', `#${interaction.options.getChannel('notify-channel').name}`, true)
                                    .addField('Notify Role', interaction.options.getRole('notify-role') ? `@${interaction.options.getRole('notify-role').name}` : 'No notify role specified.', true)
                                    .addField('Notify Users', usersToNotify.map(user => `<@${user}>`).join(', '), true)
                                    .addField('Analytics', interaction.options.getString('enable-analytics') === 'true' ? 'Enabled' : 'Disabled', true)
                                    .addField('Follow Expires', new Date(mongoEntry.tournEnd).toString(), true)
                                interaction.editReply({ embeds: [followEmbed] })
                            })
                    })
                })
        }
    }
}
