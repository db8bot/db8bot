exports.run = function (client, message, args, args2, cmd) {
    const Discord = require('discord.js')
    const config = client.config;
    var guild = message.guild;
    message.channel.send(args.join(' '))
    function getDefaultChannel(guild) {
        if (guild.channels.cache.some(name1 => name1.name === "general"))
            return guild.channels.cache.find(name => name.name === "general");
        // Now we get into the heavy stuff: first channel in order where the bot can speak
        // hold on to your hats!
        return guild.channels.cache
            .filter(c => c.type === "GUILD_TEXT" &&
                c.permissionsFor(guild.client.user).has(Discord.Permissions.FLAGS.SEND_MESSAGES))
            .sort((a, b) => a.position - b.position ||
                Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
            .first();

    }
    if (message.author.id === config.owner) {
        try {
            getDefaultChannel(client.guilds.cache.find(val1 => val1.name === args.join(' '))).createInvite({ maxAge: 30 }).then(inv => message.channel.send(inv.url ? inv.url : "discord.gg/" + inv.code)).catch(e => console.error(e))
        } catch (error) {
            console.log(error)
            message.reply(' they don\'t allow me to generate invites :(')
        }
    } else {
        message.reply(" only AirFusion gets to spy on servers, sorry.")
    }
}
