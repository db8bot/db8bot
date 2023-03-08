const { Client, Intents, Collection, GatewayIntentBits, EmbedBuilder, Permissions, REST, Routes } = require('discord.js')
const fs = require('fs')
const path = require('path')
const fsp = require('fs').promises
const winston = require('winston')
const express = require('express')
const cookieParser = require('cookie-parser')
const { exec } = require('child_process')

// client initialization
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ],
    partials: [
        'CHANNEl'
    ]
})

// register events in /events
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

// store commands names in universal var
client.commands = new Collection()

// register commands
const commands = []
const commandsPath = path.join(__dirname, 'commands')
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
    }
}

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`)

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(process.env.BOTID),
            { body: commands }
        )

        console.log(`Successfully reloaded ${data.length} application (/) commands.`)
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error)
    }
})()

// setup local logging service
client.logger = new winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './log.txt' })
    ]
})

// setup owner cmds

client.on('messageCreate', async message => {
    function clean(text) {
        if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
    }

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

    if (prefix === `<@${process.env.BOTID}>`) {
        if (command === 'test') {
            message.channel.send('test')
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
        }
    }
})

// setup express server to receive requests from blaze api
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
app.set('client', client)

// setup express routes
app.use('/ocrinbound', require('./routes/ocrReceive'))
app.use('/getinbound', require('./routes/getReceive'))
app.use('/heartbeat', require('./routes/heartbeat'))

// auth & express listen
var port = process.env.PORT
if (port == null || port === '') {
    port = 8081
}
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
client.login(process.env.TOKEN)
