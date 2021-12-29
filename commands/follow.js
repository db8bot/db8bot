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
                .setDescription('tabroom.com URL of the entries page that includes the team you want to follow. URL should include fields.mhtml')
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
                .setDescription('Mention user1 to be notified with updates. 5 users max. If you need more than 5, see the role option.')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('notify-user2')
                .setDescription('Mention user2 to be notified with updates. 5 users max. If you need more than 5, see the role option.')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('notify-user3')
                .setDescription('Mention user3 to be notified with updates. 5 users max. If you need more than 5, see the role option.')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('notify-user4')
                .setDescription('Mention user4 to be notified with updates. 5 users max. If you need more than 5, see the role option.')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('notify-user5')
                .setDescription('Mention user5 to be notified with updates. 5 users max. If you need more than 5, see the role option.')
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

        var payload = {
            apiauth: process.env.TABAPIKEY,
            username: process.env.TABUSERNAME,
            password: process.env.TABPASSWORD
        }
        superagent
            .post('https://debateapis.wm.r.appspot.com/login')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(JSON.parse(payload))
            .end((err, res) => {
                if (err) console.error(err)
                var token = res.body.token
                var followPayload = {
                    apiauth: process.env.TABAPIKEY,
                    token: token,
                    entryLink: interaction.options.getString('entry-list'), // need to be regex tested for the correct link
                    code: interaction.options.getString('team-code')
                }
                superagent
                    .post('https://debateapis.wm.r.appspot.com/me/follow')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .send(JSON.parse(followPayload))
                    .end((err, res) => {
                        if (err) console.error(err)
                        // add info to database
                        // return success msg
                    })
            })
    }
}
