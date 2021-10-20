// Constant Definitions
require('dotenv').config({ path: './dev.env' })
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

const versionSelector = 'dev'
const testServerGuildID = '689368206904655878'
if (versionSelector === 'dev') {
    // eslint-disable-next-line no-var
    var config = require('./configDev.json')
    client.config = require('./configDev.json')
} else {
    // eslint-disable-next-line no-var
    var config = require('./config.json')
    client.config = require('./config.json')
}

// setup slash commands
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    if (versionSelector === 'dev') {
        if (Object.keys(client.config.serverSpecificCommandsMap).includes(file.replace('.js', ''))) {
            serverSpecificCommands.push(command.data.toJSON())
        } else {
            commands.push(command.data.toJSON())
        }
    } else {
        commands.push(command.data.toJSON())
    }
    client.commands.set(command.data.name, command)
}

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.')

        if (versionSelector === 'dev') { // if dev use the test server id
            await rest.put(
                Routes.applicationGuildCommands(client.config.botid, testServerGuildID),
                { body: commands }
            )
        } else {
            for (var i = 0; i < serverSpecificCommands.length; i++) {
                console.log(client.config.serverSpecificCommandsMap[serverSpecificCommands[i].name].length)
                for (var j = 0; j < client.config.serverSpecificCommandsMap[serverSpecificCommands[i].name].length; j++) {
                    await rest.put(
                        Routes.applicationGuildCommands(client.config.botid, client.config.serverSpecificCommandsMap[serverSpecificCommands[i].name][j]),
                        { body: [serverSpecificCommands[i]] }
                    )
                }
            }
            await rest.put(
                Routes.applicationCommands(client.config.botid),
                { body: commands }
            )
        }
        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
})()

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

client.on('messageCreate', message => {
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
    if (message.content.indexOf('<@!') === 0) {
        var prefix = `<@!${client.config.botid}>`
        var args = message.content.replace(prefix, '').split(' ').filter(n => n)
        var command = args.shift().toLowerCase()
    } else {
        var prefix = message.content.split('')[0]
        var args = message.content.slice(config.prefix.length).trim().split(/ +/g)
        var command = args.shift().toLowerCase()
    }

    if ((!message.content.startsWith(config.prefix) && !message.content.startsWith('/') && !message.content.startsWith(`<@!${client.config.botid}`)) || message.author.bot) return
    if (message.content.indexOf(config.prefix) !== 0 && message.content.indexOf('/') !== 0 && message.content.indexOf(`<@!${client.config.botid}`) !== 0) return

    // message.guild.commands.set([]) // reset server slash commands

    if (prefix === '/') {
        if (command === 'clean') {
            client.logger.log('info', `clean command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
            message.channel.messages.fetch({ limit: 1 }).then(chanmsg => {
                if (chanmsg.last().content === `${client.config.prefix}clean` && chanmsg.last().attachments.first() === undefined) { // no image in current msg
                    message.channel.messages.fetch({ limit: 2 }).then(chanmsg2 => { // check last message
                        if (chanmsg2.last().attachments.first() !== undefined) {
                            superagent.get(chanmsg2.last().attachments.first().url).pipe(
                                new PNG({
                                    colorType: 2,
                                    bgColor: {
                                        red: 255,
                                        green: 255,
                                        blue: 255
                                    }
                                })
                            ).on('parsed', async function () {
                                var sendDataArr = []
                                const createWriteStream = () => {
                                    return stream.Writable({
                                        write(chunk, enc, next) {
                                            sendDataArr.push(chunk)
                                            next()
                                        }
                                    })
                                }
                                const writeStream = createWriteStream()
                                this.pack().pipe(writeStream)
                                writeStream.on('finish', () => {
                                    message.channel.send({ files: [Buffer.concat(sendDataArr)] })
                                })
                            })
                        }
                    })
                } else if (chanmsg.first().attachments.first() !== undefined) {
                    superagent.get(chanmsg.first().attachments.first().url).pipe(
                        new PNG({
                            colorType: 2,
                            bgColor: {
                                red: 255,
                                green: 255,
                                blue: 255
                            }
                        })
                    ).on('parsed', async function () {
                        var sendDataArr = []
                        const createWriteStream = () => {
                            return stream.Writable({
                                write(chunk, enc, next) {
                                    sendDataArr.push(chunk)
                                    next()
                                }
                            })
                        }
                        const writeStream = createWriteStream()
                        this.pack().pipe(writeStream)
                        writeStream.on('finish', () => {
                            message.channel.send({ files: [Buffer.concat(sendDataArr)] })
                        })
                    })
                }
            })
        } else if (command === 'benmoshe<3') {
            if (message.guild.id === '685646226942984206' || message.guild.id === '688603800549851298') {
                message.reply({ content: 'wHy r u rEaDINg bEn mOSHe', files: ['./assets/benmoshe.png'] })
            }
        }
    } else if (prefix === '-' && command !== '') {
        message.channel.send('use slash commands msg.')
    } else if (prefix === `<@!${client.config.botid}>`) {
        if (command === 'test') {
            message.channel.send('ping')
        } else if (command === 'ownerhelp') {
            const ownercmds = new MessageEmbed()
                .setColor('#ffd700')
                .setDescription('If you are not the owner, this list is just to make you jealous... Hehe - Owner superpowers :p')
                .addField('Set bot game', 'cmd: setgame <args>')
                .addField('Set bot status', 'cmd: setstatus <args>')
                .addField('Get all of the servers bot is in', 'cmd: getallserver')
                .addField('leaves the inputed server. Server name has to be exact.', 'cmd: leaveserver <args>')
                .addField('broadcast a message', 'cmd: broadcast <message/args>')
                .addField('get log', 'cmd: getlog')
                .addField('Emergency STOP, incase things get out of control requires pm2, otherwise use restart', 'cmd: killall')
                .addField('Manual restart', 'cmd: restart requries pm2, otherwise works as a killall cmd')
                .addField('exec cmd/bash scripts', 'cmd: exec <args>')
                .addField('evals code from discord chatbox', 'cmd: eval <code>')
                .addField("change the bot's prefix", 'cmd: prefix <new prefix which no one will know>')
                .addField('spyon servers by gening invites', 'cmd:spyon <server name>')
                // .addField("get all loaded user info", "cmd: alluserinfo")
                .addField('Get the host machine\'s IP address ONLY!', 'cmd: -gethostip')
                .addField('Send Msg to a server', 'cmd: sendmsgto <server name: exact> <msg>')
                .addField('Server id to name', 'cmd: idtoname <serverid>')

            message.channel.send({ embeds: [ownercmds] })
        }
    } else if (command === 'setgame') {
        if (message.author.id === client.config.owner) {
            if (['playing', 'streaming', 'listening', 'watching', 'competing'].includes(args[0].toLowerCase())) {
                args.shift()
                client.user.setActivity(args.join(' '), { type: args[0].toUpperCase() })
            } else {
                client.user.setActivity(args.join(' '))
            }
        }
    } else if (command === 'setstatus') {
        if (message.author.id === client.config.owner) {
            if (['online', 'idle', 'invisible', 'dnd'].includes(args.join(' ').toLowerCase())) {
                client.user.setStatus(args.join(' '))
            } else {
                message.channel.send('invalid status')
            }
        }
    } else if (command === 'getallserver') {
        if (message.author.id === client.config.owner) {
            var user = message.author
            var serverNameStr = client.guilds.cache.map(e => e.toString()).join(', ')
            while (serverNameStr.length > 1990) {
                user.send(serverNameStr.substring(0, 1990))
                serverNameStr = serverNameStr.replace(serverNameStr.substring(0, 1990), '')
            }
            user.send(serverNameStr)
        }
    } else if (command === 'idtoname') {
        if (message.author.id === client.config.owner) {
            const getx = client.guilds.cache.find(server => server.id === args.join(' '))
            message.author.send(getx.name)
        }
    } else if (command === 'broadcast') {
        if (command.author.id === client.config.owner) {
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
        if (message.author.id === client.config.owner) {
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
        if (message.author.id === config.owner) {
            var guild = client.guilds.cache.find(val => val.name === args.join(' ')).leave()
        }
    }
})

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
client.login(config.token)
