async function channelSendSingleGuildSingleUser(client, body, content) {
    if (body.serverID) { // its a guild
        const sendGuild = await client.guilds.fetch(body.serverID)
        if (sendGuild.available) {
            var guildChannels = await sendGuild.channels.fetch(body.channelID)
            try {
                guildChannels.send(content).catch(err => {
                    if (err.message === 'fetch failed') { // for get files > 8mb
                        delete content.files
                        guildChannels.send(content)
                    }
                    console.error(err)
                })
            } catch (err) {
                console.error(err)
                return (err)
            }
        }
    } else { // in dms
        const user = await client.users.fetch(body.dmUser)
        try {
            user.send(content)
        } catch (err) {
            console.error(err)
            return (err)
        }
    }
}

module.exports = {
    channelSendSingleGuildSingleUser
}
