exports.run = function (client, message, args) {

    var JSSoup = require('jssoup').default;
    const superagent = require('superagent');
    const Discord = require('discord.js');
    const config = client.config;

    var replaceHtmlEntites = (function () {
        var translate_re = /&(nbsp|amp|quot|lt|gt);/g,
            translate = {
                'nbsp': String.fromCharCode(160),
                'amp': '&',
                'quot': '"',
                'lt': '<',
                'gt': '>',
                'rsquo': '\'',
                'ldquo': '"'
            },
            translator = function ($0, $1) {
                return translate[$1];
            };

        return function (s) {
            return s.replace(translate_re, translator);
        };
    })();
    client.logger.log('info', `judgeinfo command used by ${message.author.tag} Time: ${Date()} Guild: ${message.guild}`)
    const help = new Discord.MessageEmbed()
            .setColor("#f0ffff")
            .setDescription("**Command: **" + `${config.prefix}judgeinfo`)
            .addField("**Usage:**", `${config.prefix}judgeinfo <tabroom judge's firstname> <judge lastname>`)
            .addField("**Example:**", `${config.prefix}judgeinfo Bob Ross`)
            .addField("**Expected Result From Example:**", "Bot will return the judge's paradigm along with the direct link to the paradigm.")
            .addField("**NOTES:**", "This command is in beta. It might not work as expected. The bot will return the paradigm in discord code blocks (cause it's better looking), however if something goes wrong, it will send the paradigm in plain text!")
    if (args.join(' ')===""||args.join(' ').indexOf(" ")===-1) {
        message.channel.send({ embed: help })
        return;
    }
    superagent
        .get(`https://www.tabroom.com/index/paradigm.mhtml?search_first=${args[0]}&search_last=${args[1]}`)
        .end((err, res) => {
            // console.log(args[0])
            // console.log(args[1])
            // console.log(res.text)
            var soup = new JSSoup(res.text);
            // var soup = new JSSoup(`<html><head></head><body><div class=paradigm><p>hihihi</p></div></body></html>`);
            // console.log(soup)
            var paraDiv = soup.find('div', { 'class': 'paradigm' })
            
            // console.log(paraDiv)
            // var paraDiv = soup.find('span', {'class':'third rightalign semibold bluetext'})
            // console.log(paraDiv.nextElement.previousElement.content)
            // console.log(paraDiv.nextElement.content)
            // console.log(paraDiv.content)
            // console.log("MASTER:" + paraDiv.nextElement.previousElement.text.length)
            // console.log("MASTER:" + paraDiv)
            var substrVar = 0;
            var placement = 0;
            var cleaned = "";
            try {
                for (var i = 0; i < Math.ceil((paraDiv.nextElement.previousElement.text.length) / 2000); i++) {

                    if (i + 1 === Math.ceil((paraDiv.nextElement.previousElement.text.length) / 2000)) {
                        // console.log((paraDiv.nextElement.previousElement.text).substring(substrVar).length)
                        if ((paraDiv.nextElement.previousElement.text).substring(substrVar).length > 1994) {
                            i--;
                        } else {
                            // cleaned = (paraDiv.nextElement.previousElement.text).substring(substrVar).replace("&lt;", "<")
                            // cleaned = cleaned.replace("&gt;", ">")
                            // cleaned = cleaned.replace("&amp;", "&")
                            cleaned = replaceHtmlEntites((paraDiv.nextElement.previousElement.text).substring(substrVar))
                            while (cleaned.indexOf("&rsquo;") != -1) {
                                cleaned = cleaned.replace("&rsquo;", '\'')
                            }
                            message.channel.send("```" + cleaned + "```")
                        }
                    } else {
                        var est = (paraDiv.nextElement.previousElement.text).substring(substrVar + 1994, substrVar + 1995).indexOf(" ")
                        placement = substrVar + 1994
                        if (est === -1) {
                            est = (paraDiv.nextElement.previousElement.text).substring(substrVar + 1985, substrVar + 1995).indexOf(" ")
                            placement = substrVar + 1985
                        }
                        // message.channel.send((paraDiv.nextElement.previousElement.text).substring(substrVar, substrVar+2000))
                        // console.log((paraDiv.nextElement.previousElement.text).substring(substrVar, placement + est).length)

                        // cleaned = (paraDiv.nextElement.previousElement.text).substring(substrVar, placement + est).replace("&lt;", "<")
                        // cleaned = cleaned.replace("&gt;", ">")
                        // cleaned = cleaned.replace("&amp;", "&")
                        cleaned = replaceHtmlEntites((paraDiv.nextElement.previousElement.text).substring(substrVar, placement + est))
                        // message.channel.send("```" + (paraDiv.nextElement.previousElement.text).substring(substrVar, placement + est) + "```")
                        while (cleaned.indexOf("&rsquo;") != -1) {
                            cleaned = cleaned.replace("&rsquo;", '\'')
                        }
                        message.channel.send("```" + cleaned + "```")
                    }
                    // substrVar+=2000;
                    substrVar = est + placement;
                }
            }
            catch (err) {
                console.log("FALL BACK")
                if (paraDiv===undefined) {
                    message.reply("Judge not found!")
                    message.channel.send({embed:help})
                    return;
                }
                for (var i = 0; i < Math.ceil((paraDiv.nextElement.previousElement.text.length) / 2000); i++) {
                    if (i + 1 === Math.ceil((paraDiv.nextElement.previousElement.text.length) / 2000)) {
                        message.channel.send((paraDiv.nextElement.previousElement.text).substring(substrVar))
                    } else {
                        message.channel.send((paraDiv.nextElement.previousElement.text).substring(substrVar, substrVar + 2000))
                    }
                    substrVar += 2000;
                }
            }
            message.channel.send(`Direct Link: https://www.tabroom.com/index/paradigm.mhtml?search_first=${args[0]}&search_last=${args[1]}`)
        })

}