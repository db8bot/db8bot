exports.run = async function (client, message, args) {
    const superagent = require('superagent');
    // require('superagent-proxy')(superagent);
    const querystring = require('querystring');
    var scholar = require('google-scholar-link')
    const Discord = require('discord.js');
    const { http, https } = require('follow-redirects');
    const config = client.config
    const child_process = require('child_process')
    const mediaDomains = require('../mediaDomains.json');
    const mediaProfilesAllowCookies = require('../mediaProfilesAllowCookies.json') // dont remove before page load - if not in the remove after page load, the cookie is kept
    const mediaProfilesRemoveCookies = require('../mediaProfilesRemoveCookies.json') // remove after page load
    const mediaProfilesRemoveAllExcept = require('../mediaProfilesRemoveAllExcept.json')
    const mediaProfilesRemove = require('../mediaProfilesRemove.json')
    const googleBotList = require('../googleBot.json')
    const bingBotList = require('../bingBot.json')
    const mediaProfilesAmp = require('../mediaProfilesAMP.json')
    const blockedPageReqRegexes = require('../mediaProfilesBlockedPageReqRegex')
    const mediaProfilesDisableJS = require('../mediaProfilesDisableJS.json')
    const useOutline = require('../useOutline.json')
    var uas = {
        "google": 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        "bing": "'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'"
    }
    const psl = require('psl');
    const fs = require('fs').promises
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var scholarLink = ""
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } if (args.join(' ') === "" || args.join(' ').indexOf("http") === -1) {
        const help = new Discord.MessageEmbed()
            .setColor("#f0ffff")
            .setDescription("**Command: **" + `${config.prefix}get`)
            .addField("**Usage:**", `${config.prefix}get <research report link/doi link>`)
            .addField("**Usage 2:**", `${config.prefix}get m <media link, ex: nytimes.com>`)
            .addField("**Example:**", `${config.prefix}get https://www.doi.org/10.2307/1342499/`)
            .addField("**Example 2:**", `${config.prefix}get m https://www.bloomberg.com/news/articles/2021-06-13/a-meme-stock-is-born-how-to-spot-the-next-reddit-favorite`)
            .addField("**Expected Result From Example:**", "Bot will search sci-hub for the specified document. If it is found, it will return a PDF to the channel. If PDF is too large, the PDF link will be sent.")
            .addField("**Expected Result From Example 2:**", "Bot will return a PDF file that contians the unlocked content. This feature is in beta & may not always work on all media sites.")
        message.channel.send({ embeds: [help] })
        return;
    }



    if ((args[0].toLowerCase() != 'r') && (args[0].toLowerCase() === 'm' || (mediaDomains.some(v => args[args.length - 1].includes(v))))) {
        var url = args.pop()
        var filename = "./newsTempOutFiles/" + getRndInteger(999, 999999).toString() + message.channel.id + "x" + ".pdf"
        var urlParsed = psl.parse(url.replace('https://', "").replace('http://', "").split('/')[0])
        if (googleBotList.some(str => str.includes(urlParsed.domain))) {
            var ua = uas['google']
        } else if (bingBotList.some(str => str.includes(urlParsed.domain))) {
            var ua = uas['bing']
        } else {
            var ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4538.0 Safari/537.36"
        }
        var options = { // flags
            "allowCookies": mediaProfilesAllowCookies.some(str => str.includes(urlParsed.domain)),
            "removeCookiesAfterLoad": mediaProfilesRemoveCookies.some(str => str.includes(urlParsed.domain)),
            "removeAllCookiesExcept": mediaProfilesRemoveAllExcept[urlParsed.domain],
            "removeCertainCookies": mediaProfilesRemove[urlParsed.domain],
            "bot": googleBotList.some(str => str.includes(urlParsed.domain)) ? 'google' : bingBotList.some(str => str.includes(urlParsed.domain)) ? 'bing' : "",
            "ua": ua,
            "amp": mediaProfilesAmp[urlParsed.domain],
            "blockedPageReqRegex": blockedPageReqRegexes[urlParsed.domain],
            "disableJS": mediaProfilesDisableJS.some(str => str.includes(urlParsed.domain)),
            "outline": useOutline.some(str => str.includes(urlParsed.domain))
        }
        console.log(options)
        message.channel.send('Give it a second, it might be slow...')
        // message.channel.send(`OPTIONS:\nallowCookies: ${options.allowCookies}\nremoveCookiesAfterLoad: ${options.removeCookiesAfterLoad}\nremoveAllCookiesExcept: ${options.removeAllCookiesExcept}\nremoveCertainCookies: ${options.removeCertainCookies}\nBot: ${options.bot}\nUseragent UA: ${options.ua}\nAMP?: ${options.amp}\nblockedPageReqRegex: \`${options.blockedPageReqRegex}\`\nGive it a second, it might be slow...`)

        if (options.amp != undefined && options.amp != "") {
            url = url.replace(urlParsed.domain, options.amp).replace('www.', "") // make sure we go to the amp site if it has the amp flag
        }


        const pdfChildProcess = child_process.fork('./commands/getPDFChild.js')
        // console.log(new RegExp(options.blockedPageReqRegex))

        pdfChildProcess.send({
            link: url,
            ua: ua,
            reg: urlParsed.domain,
            allowCookies: options.allowCookies,
            removeCookiesAfterLoad: options.removeCookiesAfterLoad,
            removeAllCookiesExcept: options.removeAllCookiesExcept,
            removeCertainCookies: options.removeCertainCookies,
            disableJS: options.disableJS,
            filename: filename.toString(),
            outline: options.outline
        })
        if (options.outline) {
            pdfChildProcess.on('message', (outlineLink) => {
                message.channel.send(outlineLink)
            })
        } else {
            pdfChildProcess.on('close', async (code) => {
                console.log(`exited with code ${code}`)
                await message.channel.send({ files: [filename] })
                try {
                    await fs.rm(filename)
                } catch (e) {
                    if (e) console.error(e)
                }
            })
        }

    }
    // sci hub section below
    else if (args[0].toLowerCase() === 'r' || !mediaDomains.some(v => args[args.length - 1].includes(v))) {

        superagent
            .get(`https://sci-hub.se/${args.join(' ')}`)
            // .get(`https://sci-hub.se/https://www.doi.org/10.2307/1342499/`)
            .set("Cache-Control", "no-cache")
            .set('User-Agent', "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36")
            .set("Accept", "*/*")
            .set("Accept-Encoding", "gzip, deflate, br")
            .set("Connection", "keep-alive")
            .set("Host", "sci-hub.se")
            .redirects(5)
            // .proxy(config.proxy)
            .end((err, res) => {
                client.logger.log('info', `get command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
                // Calling the end function will send the request
                // console.log(res.text)
                try {
                    // var found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)
                    var found = res.text.match(/src=\"(.*?)\" id = "pdf"/)
                } catch {
                    found = null
                }
                // console.log(found)
                if (found === null) {
                    if (res.text.includes('libgen')) { // libgen download
                        var libgenSection = res.text.substring(res.text.indexOf('<td colspan=2>') + 14, res.text.indexOf('</a></b></td>'))
                        libgenSection = libgenSection.substring(libgenSection.indexOf(`<b><a href='`) + 12, libgenSection.indexOf(`'>`))
                        message.channel.send(`Document on libgen - Mirror selection page: ${res.request.url}`)
                        message.channel.send(`Working Download Mirror Link: ${libgenSection}`)
                    } else if (args.join(' ').includes('doi.org')) {
                        const doiRequest = https.request({
                            host: 'doi.org',
                            path: args.join(' ').substring(15)
                        }, response => {
                            // console.log(response.responseUrl);
                            superagent
                                .get(`https://sci-hub.se/${response.responseUrl}`)
                                .set("Cache-Control", "no-cache")
                                .set('User-Agent', "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36")
                                .set("Accept", "*/*")
                                .set("Accept-Encoding", "gzip, deflate, br")
                                .set("Connection", "keep-alive")
                                .set("Host", "sci-hub.se")
                                // .proxy(config.proxy)
                                .end((err, res) => {
                                    res.text.match(/src=\"(.*?)\" id = "pdf"/)
                                    if (found === null) {
                                        if (res.text.includes('libgen')) { // libgen download
                                            var libgenSection = res.text.substring(res.text.indexOf('<td colspan=2>') + 14, res.text.indexOf('</a></b></td>'))
                                            libgenSection = libgenSection.substring(libgenSection.indexOf(`<b><a href='`) + 12, libgenSection.indexOf(`'>`))
                                            const request = https.request({
                                                host: 'sci-hub.se',
                                                path: args.join(' '),
                                            }, response => {
                                                console.log(response.responseUrl);
                                                message.channel.send(`Document on libgen - Mirror selection page: ${response.responseUrl}`)
                                            });
                                            request.end();
                                            message.channel.send(`Working Download Mirror Link: ${libgenSection}`)
                                        } else {
                                            message.reply(`Not found on Sci-Hub! :( Try the following Google Scholar link (Incase they have a free PDF)`)
                                            scholarLink = scholar(querystring.escape(args.join(' ')))
                                            scholarLink = scholarLink.substring(0, scholarLink.length - 1)
                                            scholarLink = scholarLink.substring(0, scholarLink.indexOf('"')) + scholarLink.substring(scholarLink.indexOf('"') + 1)
                                            message.channel.send(scholarLink)
                                        }
                                    } else {
                                        if (found[1].indexOf("https") === -1) {
                                            found[1] = "https:" + found[1];
                                        }
                                        try {
                                            message.channel.send(found[1])
                                            message.channel.send({
                                                files: [found[1] + ".pdf"]
                                            }).catch(err => console.log(err))
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }
                                })
                        });
                        doiRequest.end();
                    } else {
                        message.reply(`Not found on Sci-Hub! :( Try the following Google Scholar link (Incase they have a free PDF)`)
                        scholarLink = scholar(querystring.escape(args.join(' ')))
                        scholarLink = scholarLink.substring(0, scholarLink.length - 1)
                        scholarLink = scholarLink.substring(0, scholarLink.indexOf('"')) + scholarLink.substring(scholarLink.indexOf('"') + 1)
                        message.channel.send(scholarLink)
                    }

                } else {
                    if (found[1].indexOf("https") === -1) {
                        found[1] = "https:" + found[1];
                    }
                    try {
                        message.channel.send(found[1])
                        message.channel.send({
                            files: [found[1] + ".pdf"]
                        }).catch(err => console.log(err))
                    } catch (e) {
                        console.log(e)
                    }
                }
            })

    }
}