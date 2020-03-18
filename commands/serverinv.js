exports.run = function (client, message) {
    var guild = message.guild;
    function getDefaultChannel(guild) {
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
    // logger.log('info', `Serverinv command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${guild}`)

}

