exports.run = function (client, message) {
    const Discord = require('discord.js');
    const config = client.config;
    var guild = message.guild;
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } const embed = new Discord.MessageEmbed()
        .setColor('36393E')
        .setTitle(message.guild.name + ` Server Stats`)
        .addField('📄 Channels', `${message.guild.channels.cache.filter(chan => chan.type === 'voice').size} Voice Channels | ${message.guild.channels.cache.filter(chan => chan.type === 'text').size} Text Channels | ${message.guild.channels.cache.filter(chan => chan.type === 'category').size} Categories | ${Math.round((message.guild.channels.cache.filter(chan => chan.type === 'voice').size / message.guild.channels.cache.size) * 100)}% Voice Channels | ${Math.round((message.guild.channels.cache.filter(chan => chan.type === 'text').size / message.guild.channels.cache.size) * 100)}% Text Channels | ${Math.round((message.guild.channels.cache.filter(chan => chan.type === 'category').size / message.guild.channels.cache.size) * 100)}% Categories`, true)
        .addField(':man: Members', `${message.guild.members.cache.filter(member => member.user.bot).size} Bots | ${(message.guild.memberCount) - (message.guild.members.cache.filter(member => member.user.bot).size)} Humans | ${message.guild.memberCount} Total Members | ${Math.round((message.guild.members.cache.filter(member => member.user.bot).size / message.guild.memberCount) * 100)}% Bots | ${Math.round((((message.guild.memberCount) - (message.guild.members.cache.filter(member => member.user.bot).size)) / message.guild.memberCount) * 100)}% Humans`, true)
        .addField(':date: Guild Created At', "" + message.guild.createdAt, true)
        .addField(`:keyboard: AFK Channel ID `, message.guild.afkChannelId === null ? "None Set" : message.guild.afkChannelID, true)
        .addField(`:keyboard: AFK Channel Timeout`, message.guild.afkTimeout + " seconds", true)
        .addField(`:frame_photo: Server Icon`, message.channel.guild.iconURL() === null ? "Default Icon" : message.channel.guild.iconURL(), true)
        .addField(`:id: Guild ID`, message.guild.id, true)
        .addField(`:man_in_tuxedo: Server Owner`, `<@${message.guild.ownerId}>`, true)
        .addField(`:man_in_tuxedo: Server Owner ID`, "" + message.guild.ownerId, true)
        .addField(`:closed_lock_with_key: Server Verification Level`, message.guild.verificationLevel, true)
        .addField(`:joystick: Roles Size`, "" + message.guild.roles.cache.size, true)
    // .setFooter(message.guild.owner.user.tag, message.guild.owner.user.avatarURL) needs priviliaged intents


    message.channel.send({ embeds: [embed] })
    // Enable this if you want server roles to be printed message.channel.send("Roles List:\n" + message.guild.roles.map(e => e.toString()).join(" "), { code: 'js' })
    client.logger.log('info', `serverinfo command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)

}