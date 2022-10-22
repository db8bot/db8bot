const { Events } = require('discord.js')
const chalk = require('chalk')

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(chalk.green('|--------------------(Loading Complete)------------------------|'))
        console.log(chalk.green('db8bot is now online and ready to go! Here are some information:'))
        console.log(chalk.green(`db8bot loaded successfully @ ${Date()}`))
        console.log(chalk.green(`Owner: ${process.env.OWNERTAG}`))
        console.log(chalk.green(`Logged in as: ${process.env.NAME} `))
        client.user.setActivity(`/help | db8bot v${require('../package.json').version} ${process.env.BUILD}`)
        // client.application.commands.set([]) // reset client application slash commands
    }
}
