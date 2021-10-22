exports.run = function (client, message, args) {
    var guild = message.guild;
    const config = client.config;
    const Discord = require('discord.js');
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    }
    try {
        const currentlyDebating = message.guild.roles.cache.find(role => role.name === "Currently Debating");
        const currentlyJudging = message.guild.roles.cache.find(role => role.name === "Currently Judging")
        const help = new Discord.MessageEmbed()
            .setColor("#f0ffff")
            .setDescription("**Command: **" + `${config.prefix}endround`)
            .addField("**Usage:**", `${config.prefix}endround <Round Name> <Decision: Spaces supported>`)
            .addField("**Example:**", `${config.prefix}endround AF-v-ND aff`)
            .addField("**Expected Result From Example:**", "Bot ends round (Note: Round data will be deleted from database) and outputs round info.")
        if (args.join(' ') === "" || args[0] === '' || args[1] === '' || args[2] === '') {
            message.channel.send({ embeds: [help] })
            return;
        } else {
            var roundInfo = client.rounds.get(guild.id + args[0]);
            if (roundInfo === undefined) {
                message.channel.send({ embeds: [help] })
                return;
            }
            var decision = "";
            var debatersID = [];
            var mentionableDebaters = "";
            for (var i = 1; i < args.length; i++) {
                decision += args[i]
            }
            if (decision === "") {
                message.channel.send({ embeds: [help] })
                return;
            }
            debatersID = roundInfo.debaters.split(" ").filter((element) => element != '')
            for (var j = 0; j < debatersID.length; j++) {
                mentionableDebaters += `<@!${debatersID[j]}>` + " "
                guild.members.fetch(debatersID[j]).then(member => {
                    member.roles.remove(currentlyDebating)
                })
            }
            guild.members.fetch(roundInfo.judge).then(member => {
                member.roles.remove(currentlyJudging)
            })
            message.reply("Round Ended! Results Below")
            const results = new Discord.MessageEmbed()
                .setTitle(`Round Ended - ${message.guild.name} ${roundInfo.name} Results`)
                .setColor("#007fff")
                .addField(`Event`, roundInfo.type)
                .addField(`Judge`, `<@!${roundInfo.judge}>`)
                .addField(`Debaters`, mentionableDebaters)
                .addField(`Decision`, decision)
                .setFooter(config.name)
                .setTimestamp()

            message.channel.send({ embeds: [results] })
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
            try {
                guild.channels.cache.find(val => val.name === "debatelog").send({ embeds: [results] }).catch(err => console.error(err))
            } catch (err) {
                console.log(err)
                message.channel.send('Friendly reminder to create a #debatelog channel for storing debate results :)')
            }
            client.rounds.delete(guild.id + args[0])
            client.logger.log('info', `endround command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
        }
    } catch (e) {
        message.channel.send('Please use in a server, not DMs.')
        console.error(e)
    }
}