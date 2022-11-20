const { Client, Intents, Collection, GatewayIntentBits, EmbedBuilder, Permissions, REST, Routes } = require('discord.js')
const fs = require('fs')
const path = require('path')
const fsp = require('fs').promises
const winston = require('winston')
const express = require('express')
const cookieParser = require('cookie-parser')

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

// setup express server to receive requests from blaze api
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
app.set('client', client)

// setup express routes
const ocrReceive = require('./routes/ocrReceive')
app.use('/ocrinbound', ocrReceive)

// auth & express listen
var port = process.env.PORT
if (port == null || port === '') {
    port = 8081
}
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
client.login(process.env.TOKEN)
