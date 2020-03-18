module.exports = async (client, guild) => {
    const config = client.config;
    const chalk = require('chalk');
    const Long = require("long");

    console.log(chalk.white(`Joined guild ${guild.name} ID: ${guild.id}  Owner ID: ${guild.ownerID} Size: ${guild.memberCount}`))
    // logger.log('info', `Joined guild ${guild.name} ID: ${guild.id}  Owner ID: ${guild.ownerID} Size: ${guild.memberCount} Time: ${Date()}`)
    // settings.set(guild.id, defaultSettings);
    // logger.log('info', `Database SET`)
    if (config.createMuteRoleUponJoin) {
        // guild.roles.create({
        //     name: `Mute`,
        //     color: 'BLACK',
        //     position: 1,
        //     hoist: false,
        //     mentionable: false,
        //     permissions: 0,

        // }).catch(e => console.error(e))
        guild.roles.create({data: {
            name: `Mute`,
            color: 'BLACK',
            position: 1,
            hoist: false,
            mentionable: false,
            permissions: 0
        }, reason: "Mute role"})
        console.log('muterole created')
    }

}