module.exports = async(client, guild) => {
    const config = client.config;
    console.log(chalk.white(`Joined guild ${guild.name} ID: ${guild.id}  Owner ID: ${guild.ownerID} Size: ${guild.memberCount}`))
    // logger.log('info', `Joined guild ${guild.name} ID: ${guild.id}  Owner ID: ${guild.ownerID} Size: ${guild.memberCount} Time: ${Date()}`)
    // settings.set(guild.id, defaultSettings);
    // logger.log('info', `Database SET`)
    if (config.createMuteRoleUponJoin) {
        guild.createRole({
            name: `Mute`,
            color: 'BLACK',
            position: 1,
            hoist: false,
            mentionable: false,
            permissions: 0,

        }).catch(e => console.error(e))
        console.log('muterole created')
    }
    client.on('message', async message => {
        message.channel.send("hi")
    })

}