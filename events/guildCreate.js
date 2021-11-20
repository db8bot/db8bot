module.exports = async (client, guild) => {
    const chalk = require('chalk')

    console.log(chalk.white(`Joined guild ${guild.name} Size: ${guild.memberCount} Date: ${Date()}`))
    client.logger.log('info', `Joined guild ${guild.name} Size: ${guild.memberCount} Date: ${Date()}`)
}
