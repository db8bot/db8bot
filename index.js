// Constant Definitions
const { Client, Intents, Collection, MessageEmbed, Permissions } = require('discord.js')
const chalk = require('chalk')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const winston = require('winston')
const fs = require('fs')
const { exec } = require('child_process')
const superagent = require('superagent')
const PNG = require('pngjs').PNG
const stream = require('stream')
const Long = require('long')
const MongoClient = require('mongodb').MongoClient
const ua = require('universal-analytics')
const express = require('express')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')

// Client Setup & Defaults Initialization
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ],
    partials: [
        'CHANNEL'
    ]
})

const commands = []
const serverSpecificCommands = []
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

// setup express
var app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// execution/launch settings
const versionSelector = 'dev'
const testServerGuildID = '689368206904655878' // test1: test2: 900260322378653726

if (versionSelector === 'prod') {
    Sentry.init({
        dsn: 'https://3a8ab5afe5824525ac1f41ebe688fbd0@o196622.ingest.sentry.io/5188131',
        tracesSampleRate: 1.0
    })

    const database = new MongoClient(process.env.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
    database.connect(async (err, dbClient) => {
        if (err) console.error(err)
        // const collection = dbClient.db('db8bot').collection('prodCommandConfig')

        var serverSpecificSlashGlobal = await dbClient.db('db8bot').collection('prodCommandConfig').find().toArray()
        serverSpecificSlashGlobal = serverSpecificSlashGlobal[0]
        delete serverSpecificSlashGlobal._id
        console.log(serverSpecificSlashGlobal)

        // serverSpecificSlashGlobal.push(serverSpecificSlash)

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`)
            if (Object.keys(serverSpecificSlashGlobal).includes(file.replace('.js', ''))) {
                serverSpecificCommands.push(command.data.toJSON())
            } else {
                try {
                    commands.push(command.data.toJSON())
                } catch (err) {
                    console.log(`File failed: ${file}`)
                }
            }
            client.commands.set(command.data.name, command)
        }

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        (async () => {
            try {
                console.log('Started refreshing application (/) commands.')

                for (var i = 0; i < serverSpecificCommands.length; i++) {
                    for (var j = 0; j < serverSpecificSlashGlobal[Object.keys(serverSpecificSlashGlobal)[i]].length; j++) {
                        await rest.put(
                            Routes.applicationGuildCommands(process.env.BOTID, serverSpecificSlashGlobal[Object.keys(serverSpecificSlashGlobal)[i]][j]),
                            { body: [serverSpecificCommands[i]] }
                        )
                    }
                }

                await rest.put(
                    Routes.applicationCommands(process.env.BOTID),
                    { body: commands }
                )

                console.log('Successfully reloaded application (/) commands.')
            } catch (error) {
                console.error(error)
            }
        })()
    })
} else if (versionSelector === 'dev') {
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`)
        commands.push(command.data.toJSON())
        client.commands.set(command.data.name, command)
    }

    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.')

            await rest.put(
                Routes.applicationGuildCommands(process.env.BOTID, testServerGuildID),
                { body: commands }
            )

            console.log('Successfully reloaded application (/) commands.')
        } catch (error) {
            console.error(error)
        }
    })()
}

// setup logger
client.logger = new winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './log.txt' })
    ]
})
client.indexLogger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'log.txt' })
    ]
})

// setup telemetry
client.telemetry = ua(process.env.TELEMETRYKEY, { strictCidFormat: false })
client.pkg = require('./package.json')

// helper functions
function clean(text) {
    if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
}

// open event listeners for events in ./events
fs.readdir('./events/', (err, files) => {
    if (err) return console.error(err)
    files.forEach(file => {
        const event = require(`./events/${file}`)
        const eventName = file.split('.')[0]
        client.on(eventName, event.bind(null, client))
    })
})

// Command Handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    const { commandName } = interaction
    if (!client.commands.has(commandName)) return

    try {
        await client.commands.get(commandName).execute(interaction)
    } catch (error) {
        console.error(error)
        return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
})

// client.legacyCommands = new Enmap()
var legacyCommandNames = ['agamben', 'amash', 'bataille', 'baudrillard', 'biden', 'botinfo', 'capitalism', 'clean', 'commands', 'communism', 'debatehelp', 'feedback', 'flip', 'foucault', 'get', 'help', 'invite', 'jpow', 'judgeinfo', 'ping', 'say', 'serverinfo', 'serverinv', 'speeches', 'trump', 'yellen'] // legacy commands list - final reminders!

client.on('messageCreate', async message => {
    const doExec = (cmd, opts = {}) => { // -exec function
        return new Promise((resolve, reject) => {
            exec(cmd, opts, (err, stdout, stderr) => {
                if (err) return reject({ stdout, stderr })
                resolve(stdout)
            })
        })
    }
    const outputErr = (msg, stdData) => {
        let { stdout, stderr } = stdData
        stderr = stderr ? ['`STDERR`', '```sh', clean(stderr.substring(0, 800)) || ' ', '```'] : []
        stdout = stdout ? ['`STDOUT`', '```sh', clean(stdout.substring(0, stderr ? stderr.length : 2046 - 40)) || ' ', '```'] : []
        const message = stdout.concat(stderr).join('\n').substring(0, 2000)
        msg.edit(message)
    }

    // command & args
    if (message.content.indexOf('<@') === 0) {
        var prefix = `<@${process.env.BOTID}>`
        var args = message.content.replace(prefix, '').split(' ').filter(n => n)
        var command = args.shift().toLowerCase()
        console.log(command)
    } else {
        var prefix = message.content.split('')[0]
        var args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g)
        var command = args.shift().toLowerCase()
    }

    if ((!message.content.startsWith(process.env.PREFIX) && !message.content.startsWith('/') && !message.content.startsWith(`<@${process.env.BOTID}`)) || message.author.bot) return
    if (message.content.indexOf(process.env.PREFIX) !== 0 && message.content.indexOf('/') !== 0 && message.content.indexOf(`<@${process.env.BOTID}`) !== 0) return

    // message.guild.commands.set([]) // clear reset server slash commands
    if (prefix === '-' && legacyCommandNames.includes(command)) {
        message.channel.send(`:warning: ${process.env.NAME} has migrated to Discord Slash Commands in preparation for Discord's mandatory transition in August 2022. Please use / to access the bot's commands. **If none of the Slash Commands work, you need to ask someone with MANAGE_SERVER permissions to reauthorize the bot using this link: https://discord.com/api/oauth2/authorize?client_id=689368779305779204&permissions=310647056497&scope=bot%20applications.commands** Thanks for your understanding!`)
    } else if (prefix === `<@${process.env.BOTID}>`) {
        if (command === 'test') {
            message.channel.send('test')
        } else if (command === 'ownerhelp') {
            const ownercmds = new MessageEmbed()
                .setColor('#ffd700')
                .setDescription('If you are not the owner, this list is just to make you jealous... Hehe - Owner superpowers :p')
                .addField('Set bot game', 'cmd: setgame <args[may include: playing, streaming, listening, watching, competing]>')
                .addField('Set bot status', 'cmd: setstatus <args>')
                .addField('Get all of the servers bot is in', 'cmd: getallserver')
                .addField('leaves the inputed server. Server name has to be exact.', 'cmd: leaveserver <args>')
                .addField('broadcast a message', 'cmd: broadcast <message/args>')
                .addField('get log', 'cmd: getlog')
                .addField('Emergency STOP, incase things get out of control requires pm2, otherwise use restart', 'cmd: killall')
                .addField('Manual restart', 'cmd: restart requries pm2, otherwise works as a killall cmd')
                .addField('exec cmd/bash scripts', 'cmd: exec <args>') // here
                .addField('evals code from discord chatbox', 'cmd: eval <code>')
                .addField("change the bot's prefix", 'cmd: prefix <new prefix which no one will know>')
                .addField('spyon servers by gening invites', 'cmd:spyon <server name>')
                // .addField("get all loaded user info", "cmd: alluserinfo")
                .addField('Get the host machine\'s IP address ONLY!', 'cmd: -gethostip')
                .addField('Send Msg to a server', 'cmd: sendmsgto <server name: exact> <msg>')
                .addField('Server id to name', 'cmd: idtoname <serverid>')

            message.channel.send({ embeds: [ownercmds] })
        } else if (command === 'setgame') {
            if (message.author.id === process.env.OWNER) {
                if (['playing', 'streaming', 'listening', 'watching', 'competing'].includes(args[0].toLowerCase())) {
                    args.shift()
                    client.user.setActivity(args.join(' '), { type: args[0].toUpperCase() })
                } else {
                    client.user.setActivity(args.join(' '))
                }
            }
        } else if (command === 'setstatus') {
            if (message.author.id === process.env.OWNER) {
                if (['online', 'idle', 'invisible', 'dnd'].includes(args.join(' ').toLowerCase())) {
                    client.user.setStatus(args.join(' '))
                } else {
                    message.channel.send('invalid status')
                }
            }
        } else if (command === 'getallserver') {
            if (message.author.id === process.env.owner) {
                var user = message.author
                var serverNameStr = client.guilds.cache.map(e => e.toString()).join(', ')
                while (serverNameStr.length > 1990) {
                    user.send(serverNameStr.substring(0, 1990))
                    serverNameStr = serverNameStr.replace(serverNameStr.substring(0, 1990), '')
                }
                user.send(serverNameStr)
            }
        } else if (command === 'idtoname') {
            if (message.author.id === process.env.OWNER) {
                const getx = client.guilds.cache.find(server => server.id === args.join(' '))
                message.author.send(getx.name)
            }
        } else if (command === 'broadcast') {
            if (command.author.id === process.env.OWNER) {
                function getDefaultChannel(guild) {
                    if (guild.channels.cache.some(name1 => name1.name === 'general')) { return guild.channels.cache.find(name => name.name === 'general') }
                    // Now we get into the heavy stuff: first channel in order where the bot can speak
                    // hold on to your hats!
                    return guild.channels.cache
                        .filter(c => c.type === 'GUILD_TEXT' &&
                            c.permissionsFor(guild.client.user).has(Permissions.FLAGS.SEND_MESSAGES))
                        .sort((a, b) => a.position - b.position ||
                            Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
                        .first()
                }
                client.guilds.cache.map(e => getDefaultChannel(e).send(args.join(' ')))
            }
        } else if (command === 'sendmsgto') {
            if (message.author.id === process.env.OWNER) {
                function getDefaultChannel(guild) {
                    if (guild.channels.cache.some(name1 => name1.name === 'general')) { return guild.channels.cache.find(name => name.name === 'general') }
                    // Now we get into the heavy stuff: first channel in order where the bot can speak
                    // hold on to your hats!
                    return guild.channels.cache
                        .filter(c => c.type === 'GUILD_TEXT' &&
                            c.permissionsFor(guild.client.user).has(Permissions.FLAGS.SEND_MESSAGES))
                        .sort((a, b) => a.position - b.position ||
                            Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
                        .first()
                }
                getDefaultChannel(client.guilds.cache.find(server => server.name === args[0])).send(args.slice(1).join(' '))
            }
        } else if (command === 'leaveserver') {
            if (message.author.id === process.env.OWNER) {
                var guild = client.guilds.cache.find(val => val.name === args.join(' ')).leave()
            }
        } else if (command === 'getlog') {
            if (message.author.id === process.env.OWNER) {
                message.author.send({ files: ['log.txt'] })
            }
        } else if (command === 'killall') {
            if (message.author.id === process.env.OWNER) {
                setTimeout(async function () {
                    const command = `pm2 stop ${versionSelector}` // add exec cmd to credits NOTE: 0 = powerbot or default host of the code [add in readme that make sure process is in #0 if using pm2] 1 = signature
                    const outMessage = await message.channel.send(`Running \`${command}\`...`)
                    let stdOut = await doExec(command).catch(data => outputErr(outMessage, data))
                    stdOut = stdOut.substring(0, 1750)
                    outMessage.edit(`\`OUTPUT\`
              \`\`\`sh
              ${clean(stdOut)}
              \`\`\``)
                }, 3000)
            }
        } else if (command === 'restart') {
            if (message.author.id === process.env.OWNER) {
                if (args.join(' ') === 'f') {
                    process.abort()
                } else {
                    process.exit(2)
                }
            }
        } else if (command === 'exec') {
            if (message.author.id === process.env.OWNER) {
                const command = args.join(' ')
                const outMessage = await message.channel.send(`Running \`${command}\`...`)
                let stdOut = await doExec(command).catch(data => outputErr(outMessage, data))
                stdOut = stdOut.substring(0, 1750)
                outMessage.edit(`\`OUTPUT\`
              \`\`\`sh
              ${clean(stdOut)}
              \`\`\``)
            }
        } else if (command === 'eval') {
            if (message.author.id === process.env.OWNER) {
                var x, y
                if (message.author.id !== process.env.OWNER) return
                x = Date.now()
                try {
                    const code = args.join(' ')
                    // eslint-disable-next-line no-eval
                    let evaled = eval(code)

                    if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled) }
                    y = Date.now()
                    message.channel.send(`:white_check_mark: Success! Time taken: \`${y - x}ms\``)
                    message.channel.send(clean(evaled), { code: 'xl' })
                    console.log(clean(evaled))
                } catch (err) {
                    y = Date.now()
                    message.channel.send(`:x: Error! Time taken: \`${y - x}ms\``)
                    message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
                }
            }
        } else if (command === 'spyon') {
            if (message.author.id === process.env.OWNER) {
                function getDefaultChannel(guild) {
                    if (guild.channels.cache.some(name1 => name1.name === 'general')) { return guild.channels.cache.find(name => name.name === 'general') }
                    // Now we get into the heavy stuff: first channel in order where the bot can speak
                    // hold on to your hats!
                    return guild.channels.cache
                        .filter(c => c.type === 'GUILD_TEXT' &&
                            c.permissionsFor(guild.client.user).has(Permissions.FLAGS.SEND_MESSAGES))
                        .sort((a, b) => a.position - b.position ||
                            Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
                        .first()
                }
                try {
                    getDefaultChannel(client.guilds.cache.find(val1 => val1.name === args.join(' '))).createInvite({ maxAge: 30 }).then(inv => message.channel.send(inv.url ? inv.url : 'discord.gg/' + inv.code)).catch(e => console.error(e))
                } catch (error) {
                    console.log(error)
                    message.reply(' they don\'t allow me to generate invites :(')
                }
            }
        } else if (command === 'gethostip') {
            if (message.author.id === process.env.OWNER) {
                superagent
                    .get(`https://ipinfo.io/json?token=${process.env.IPINFOTOKEN}`)
                    .end((err, res) => {
                        const response = JSON.parse(res.text)
                        if (err) console.error(err)
                        const embed = new MessageEmbed()
                            .setTitle("PowerBot's Host's IP Information - PowerBot Does NOT Log IP Addresses")
                            .setColor('36393E')
                            .setTimestamp()
                            .addField('IP', response.ip)
                            .addField('Host', response.hostname)
                            .addField('City', response.city)
                            .addField('Region', response.region)
                            .addField('Country', response.country)
                            .addField('Location Cords', response.loc)
                            .addField('Postal/Zip Code', response.postal)
                            .addField('ISP/Organization', response.org)
                        message.author.send({ embeds: [embed] })
                    })
            }
        }
    }
})

// express routing
const mailIn = require('./routes/mailIn')
app.set('client', client) // pass client on to express for use in routes
app.use('/mailin', mailIn)

const token = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g
client.on('debug', error => {
    console.log(chalk.cyan(error.replace(token, 'HIDDEN')))
})
client.on('warn', error => {
    console.log(chalk.yellow(error.replace(token, 'HIDDEN')))
})
client.on('error', (error) => {
    console.error(chalk.red(error.replace(token, 'HIDDEN')))
})
client.login(process.env.TOKEN)

var port = process.env.PORT
if (port == null || port === '' || versionSelector === 'dev') {
    port = 8080
}
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
