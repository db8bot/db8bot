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
    if (message.guild != null) {
        message.channel.guild.members.fetch(client.user).then(user => {
            var joinDate = new Date(user.joinedTimestamp)
            if ((joinDate > 1616457600000 && joinDate < 1634860800000) && !(client.scopeUpdate.get(message.guild.id))) {
                const scopeUpdateMsg = new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('db8bot Needs to be Reauthorized! - One Time Action')
                    .setDescription('You only need to click the authorization link ONCE. It is included in multiple places to make it easier to find. For questions, contact AirFusion#1706 on Discord')
                    .addField('TL;DR', 'db8bot needs to reauthorized as soon as possible by a member with **Manage Guild/Manage Server** permissions using [this link](https://discord.com/api/oauth2/authorize?client_id=689368779305779204&permissions=310647056497&scope=bot%20applications.commands) because Discord is enforcing slash commands in April 2022.')
                    .addField('Why?', 'Discord will be enforcing bots to use Slash commands (instead of commands with a prefix) starting April 2022. In order for that to work, **bots invited after March 2021 need to be reauthorized using [this](https://discord.com/api/oauth2/authorize?client_id=689368779305779204&permissions=310647056497&scope=bot%20applications.commands) link. (If you are getting this message, it means you invited db8bot after March 2021).** See Discord\'s announcement [here](https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Access-Deprecation-for-Verified-Bots). db8bot will transition to slash commands in less than 2 months so we can fix bugs before the mandatory transition.')
                    .addField('How?', 'Reauthorize db8bot using [this](https://discord.com/api/oauth2/authorize?client_id=689368779305779204&permissions=310647056497&scope=bot%20applications.commands) link. It needs to be done by members with the __**manage server**__ permission. You **do not need to kick db8bot.** Just click on the link and "re-add" the bot to your server.')
                    .addField('What if I don\'t reauthorize?', 'db8bot will stop functioning in your server beginning April 2022. You can reauthorize anytime to restore functionality.')
                    .addField('Stop this message', 'To stop receiving this message, ask a member with the `Manage Server` permission to execute `-stopnotice`.')

                message.channel.send({ embeds: [scopeUpdateMsg] })
            }
        })
    }
    client.logger.log('info', `serverinfo command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)

}