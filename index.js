// Constant Definitions
const { Client, Intents, Collection } = require('discord.js')
const chalk = require('chalk')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const winston = require('winston')
const fs = require('fs')
const { exec } = require('child_process')

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
    if (Object.keys(client.config.serverSpecificCommandsMap).includes(file.replace('.js', ''))) {
        serverSpecificCommands.push(command.data.toJSON())
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
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()

    if (!message.content.startsWith(config.prefix) || message.author.bot) return
    if (message.content.indexOf(config.prefix) !== 0) return
    // message.guild.commands.set([]) // reset server slash commands
    if (command === 'pingsock') {
        message.channel.send('pongSock')
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
