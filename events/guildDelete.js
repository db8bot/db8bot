module.exports = async (client, guild) => {
    const config = client.config;
    const chalk = require('chalk');
    const Long = require("long");

    if (!guild.available) return; // If there is an outage, return.
    
    console.log(chalk.white(`Left/Kicked from guild ${guild.name} ID: ${guild.id}  Owner ID: ${guild.ownerID} Size: ${guild.memberCount}`))

}