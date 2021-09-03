module.exports = async (client, guild) => {
    const chalk = require('chalk');
    if (!guild.available) return; // If there is an outage, return.
    console.log(chalk.white(`Left/Kicked from guild ${guild.name} Size: ${guild.memberCount}`))
    client.logger.log('info', `Left/Kicked from guild ${guild.name} Size: ${guild.memberCount}`)
}