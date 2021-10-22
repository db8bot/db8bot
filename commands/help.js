function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

exports.run = function (client, message) {
    const Discord = require('discord.js');
    const config = client.config;
    var select = getRandomIntInclusive(1, 3);
    const embed = new Discord.MessageEmbed()
        .setColor(select === 1 ? "#ccff00" : select === 2 ? "#0072bb" : select === 3 ? "#ff4f00" : "#ccff00")
        .setTitle("DB8Bot Help\n")
        .addField('Prefix', `\`${config.prefix}\``)
        .addField('Example:', `\`${config.prefix}ping\``)
        .addField('Commands:', `Do \`${config.prefix}commands\` to see a full list of commands.`)
        .addField(`Setup`, `It is recommended to have a **modlog text channel**, a **debatelog text channel** and a **Mute role called "Mute"**. Note the \`mute\` command will not work unless you have a Mute role.`)
        // .addField('Checklist:', `Please run the command \`${config.prefix}checklist\` to check if db8bot has all the required permissions to run.`)
        .addField(`Opt-outs`, `User the \`${config.prefix}optout\` to opt-out of any command including dm & userinfo.`)
        .addField(`Privacy`, `For information about the data we collect please visit [here](https://github.com/AirFusion45/db8bot#privacy)`)
        .addField(`Debate Function Help`, `For detailed help on how to use the debate functions, use the ${config.prefix}debatehelp command.`)
        .addField('Github', `The repo for this bot can be found [here](https://github.com/AirFusion45/db8bot).`)
        .addField(`Bot Status`, `The bot has a status page [here](https://airfusion.statuspage.io/). Please check this page first if a function isn't working. We might already be patching it!`)
        .addField('Support Server:', `Come [here](https://discord.gg/rEQc7C7) to get help or just hang out.`)
        .addField('Bot Invite Link', `Use \`${config.prefix}invite\` for the bot's invite link, or click [here](https://discordapp.com/oauth2/authorize?client_id=689368779305779204&scope=bot&permissions=2146958847)`)
        .setFooter(`Made by ${config.ownerTag}`)
        .setTimestamp()

    message.channel.send({ embeds: [embed] })
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
    client.logger.log('info', `help command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
}