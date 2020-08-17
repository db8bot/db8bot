exports.run = function (client, message, args) {
    const superagent = require('superagent');
    const Discord = require('discord.js');
    const config = client.config;
    const { det } = require("detergent");
    const stripHtml = require("string-strip-html");
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } function getPosition(string, subString, index) {
        return string.split(subString, index).join(subString).length;
    }
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
    client.logger.log('info', `judgeinfo command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
    const help = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}judgeinfo`)
        .addField("**Usage:**", `${config.prefix}judgeinfo <tabroom judge's firstname> <judge lastname>`)
        .addField("**Example:**", `${config.prefix}judgeinfo Bob Ross`)
        .addField("**Expected Result From Example:**", "Bot will return the judge's paradigm along with the direct link to the paradigm.")
        .addField("**NOTES:**", "This command is in beta. It might not work as expected. The bot will return the paradigm in discord code blocks (cause it's better looking), however if something goes wrong, it will send the paradigm in plain text!")
    if (args.join(' ') === "" || args.join(' ').indexOf(" ") === -1) {
        message.channel.send({ embed: help })
        return;
    }
    superagent
        .get(`https://www.tabroom.com/index/paradigm.mhtml?search_first=${args[0]}&search_last=${args[1]}`)
        .end((err, res) => {
            var paradigm = res.text.substring(res.text.indexOf(`<div class="paradigm">`) + `<div class="paradigm">`.length, getPosition(res.text, '</div>', 6))
            var clean;
            clean = det(paradigm), {
                fixBrokenEntities: true,
                removeWidows: true,
                convertEntities: true,
                convertDashes: true,
                convertApostrophes: true,
                replaceLineBreaks: true,
                removeLineBreaks: false,
                useXHTML: true,
                dontEncodeNonLatin: true,
                addMissingSpaces: true,
                convertDotsToEllipsis: true,
                stripHtml: true,
                stripHtmlButIgnoreTags: [
                    "b",
                    "i",
                    "em",
                    "sup"
                ],
                stripHtmlAddNewLine: ["li", "/ul"],
                cb: null
            }
            clean = stripHtml(clean.res)
            if (clean.indexOf(`Your search for ${args[0]} ${args[1]} returned no judges with paradigms.`) != -1) {
                message.channel.send(`Your search for ${args[0]} ${args[1]} returned no judges with paradigms. Please try again.`)
                message.channel.send(`Direct Link: https://www.tabroom.com/index/paradigm.mhtml?search_first=${args[0]}&search_last=${args[1]}`)
                return;
            }

            var substrVar = 0;
            var placement = 0;
            var cleaned = "";
            try {
                for (var i = 0; i < Math.ceil((clean.length) / 2000); i++) {

                    if (i + 1 === Math.ceil((clean.length) / 2000)) {
                        if ((clean).substring(substrVar).length > 1994) {
                            i--;
                        } else {
                            cleaned = replaceHtmlEntites((clean).substring(substrVar))
                            while (cleaned.indexOf("&rsquo;") != -1 || cleaned.indexOf("&ldquo;") != -1 || cleaned.indexOf("&rdquo;") != -1 || cleaned.indexOf("&#x2AAF") != -1) {
                                cleaned = cleaned.replace("&rsquo;", '\'')
                                cleaned = cleaned.replace("&ldquo;", '"')
                                cleaned = cleaned.replace("&rdquo;", '"')
                                cleaned = cleaned.replace("&#x2AAF", "&")
                            }
                            message.channel.send("```\n" + cleaned + "\n```")
                        }
                    } else {
                        var est = (clean).substring(substrVar + 1994, substrVar + 1995).indexOf(" ")
                        placement = substrVar + 1994
                        if (est === -1) {
                            est = (clean).substring(substrVar + 1985, substrVar + 1995).indexOf(" ")
                            placement = substrVar + 1985
                        }
                        cleaned = replaceHtmlEntites((clean).substring(substrVar, placement + est))
                        while (cleaned.indexOf("&rsquo;") != -1 || cleaned.indexOf("&ldquo;") != -1) {
                            cleaned = cleaned.replace("&rsquo;", '\'')
                            cleaned = cleaned.replace("&ldquo;", '"')
                            cleaned = cleaned.replace("&rdquo;", '"')
                            cleaned = cleaned.replace("&#x2AAF", "&")
                        }
                        message.channel.send("```" + cleaned + "```")
                    }
                    substrVar = est + placement;
                }
            }
            catch (err) {
                console.log("FALL BACK")
                if (paradigm === undefined) {
                    message.reply("Judge not found!")
                    message.channel.send({ embed: help })
                    return;
                }
                for (var i = 0; i < Math.ceil((clean.length) / 2000); i++) {
                    if (i + 1 === Math.ceil((clean.length) / 2000)) {
                        message.channel.send((clean).substring(substrVar))
                    } else {
                        message.channel.send((clean).substring(substrVar, substrVar + 2000))
                    }
                    substrVar += 2000;
                }
            }
            message.channel.send(`Direct Link: https://www.tabroom.com/index/paradigm.mhtml?search_first=${args[0]}&search_last=${args[1]}`)
        })
}