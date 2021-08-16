exports.run = function (client, message, args) {

    const superagent = require('superagent');
    const emojiUnicode = require("emoji-unicode");
    var guild = message.guild;
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    }
    // https://discord.js.org/#/docs/main/stable/class/TextChannel?scrollTo=setRateLimitPerUser - reset slowmode
    try {
        if (message.guild.id != "685646226942984206") return;
        else {
            var unicode = ""
            if (emojiUnicode(args.join(' ')).includes(" ")) {
                unicode = emojiUnicode(args.join(' ')).substring(0, emojiUnicode(args.join(' ')).indexOf(' '))
            } else {
                unicode = emojiUnicode(args.join(' '))
            }
            superagent
                .get(`https://github.com/rodrigopolo/jqueryemoji/raw/master/img/apple40/${unicode}.png`)
                .end((err, res) => {
                    if (res.header.status === '404 Not Found') {
                        message.channel.send(`Not found`)
                    } else {
                        message.channel.send({
                            files: [`https://github.com/rodrigopolo/jqueryemoji/raw/master/img/apple40/${unicode}.png`]
                        })
                    }
                })
        }
    } catch (e) {
        console.error(e)
    }
    client.logger.log('info', `emoji command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
}