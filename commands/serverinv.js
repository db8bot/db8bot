exports.run = function (client, message) {
    var guild = message.guild;
    var Long = require("long");
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } function getDefaultChannel(guild) {
        if (guild.channels.cache.some(name1 => name1.name === "general"))
            return guild.channels.cache.find(name => name.name === "general");
        // Now we get into the heavy stuff: first channel in order where the bot can speak
        // hold on to your hats!
        return guild.channels.cache
            .filter(c => c.type === "text" &&
                c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
            .sort((a, b) => a.position - b.position ||
                Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
            .first();
    }
    getDefaultChannel(message.guild).createInvite({ maxAge: 300 }).then(inv => message.channel.send(inv.url ? inv.url : "discord.gg/" + inv.code))
    client.logger.log('info', `serverinv command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)

}

