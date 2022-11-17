const Discord = require('discord.js')

async function channelSendSingleGuildSingleUser(client, body, content) {
    var sendGuild = await client.guilds.fetch(body.serverID)
    if (sendGuild.available) {
        var guildChannels = await sendGuild.channels.fetch(body.channelID)
        try {
            guildChannels.send(content)
        } catch (err) {
            console.error(err)
            return (err)
        }
    }
}

module.exports = {
    channelSendSingleGuildSingleUser
}
