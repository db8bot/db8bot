module.exports = async (client, guild) => {
    const config = client.config;
    const chalk = require('chalk');
    const Long = require("long");

    console.log(chalk.white(`Joined guild ${guild.name} ID: ${guild.id}  Owner ID: ${guild.ownerID} Size: ${guild.memberCount}`))
    client.logger.log('info', `Joined guild ${guild.name} ID: ${guild.id}  Owner ID: ${guild.ownerID} Size: ${guild.memberCount}`)

}