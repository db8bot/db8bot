exports.run = async function (client, message, args) {
    const superagent = require('superagent');
    // require('superagent-proxy')(superagent);
    const querystring = require('querystring');
    var scholar = require('google-scholar-link')
    const Discord = require('discord.js');
    const { http, https } = require('follow-redirects');
    const config = client.config
    const mediaDomains = require('../mediaDomains.json');
    const mediaProfiles = require('../mediaProfiles.json')
    const puppeteer = require('puppeteer');
    const psl = require('psl');
    const fs = require('fs')
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
            .addField("**Example:**", `${config.prefix}get https://www.doi.org/10.2307/1342499/`)
            .addField("**Expected Result From Example:**", "Bot will search sci-hub for the specified document. If it is found, it will return a PDF to the channel. If PDF is too large, the PDF link will be sent.")
        message.channel.send({ embed: help })
        return;
    }



    if ((args[0].toLowerCase() != 'r') && (args[0].toLowerCase() === 'm' || (mediaDomains.some(v => args[args.length - 1].includes(v))))) {
        var reqLink = args.pop()
        var userAgentsBots = [
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
            "Mozilla/5.0 (compatible; adidxbot/2.0; +http://www.bing.com/bingbot.htm)"
        ]
        // https://evert.meulie.net/faqwd/googlebot-ip-ranges/
        var xforwardedfors = [
            "66.102.0.0",
            "64.18.0.0",
            "64.233.160.0"
        ]
        // var userAgent = userAgentsBots[getRndInteger(0, userAgentsBots.length - 1)]
        var userAgentsHuman = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
            "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1"
        ]
        var userAgent = userAgentsHuman[getRndInteger(0, userAgentsHuman.length - 1)]
        var xforwardedfor = xforwardedfors[getRndInteger(0, xforwardedfors.length - 1)]
        var acceptEncoding = "gzip, deflate, br"
        var referer = "https://t.co/"
        var getrequest = true;

        var reqLinkParsed = psl.parse(reqLink.replace('https://', "").replace('http://', "").split('/')[0])

        console.log(reqLink)
        console.log(reqLinkParsed.domain)
        console.log(mediaProfiles[reqLinkParsed.domain])

        if (mediaProfiles[reqLinkParsed.domain] != undefined) {
            if (mediaProfiles[reqLinkParsed.domain].amp === true) {
                reqLink = reqLink.replace(reqLinkParsed.domain, reqLinkParsed.domain + "/amp")
            }
            if (mediaProfiles[reqLinkParsed.domain].replace != undefined) {
                var replaceValues = mediaProfiles[reqLinkParsed.domain].replace.split(' ')
                reqLink = reqLink.replace(replaceValues[0], replaceValues[1])
            }
            if (mediaProfiles[reqLinkParsed.domain].open == "send") {
                getrequest = false
                message.channel.send(`Use this link: ${reqLink}`)
            } else {
                if (mediaProfiles[reqLinkParsed.domain].open === true) {
                    message.channel.send(`Puppeteer with ${reqLink} | amp status: ${mediaProfiles[reqLinkParsed.domain].amp}`)
                    console.log(`here`)
                    getrequest = false
                    var filename = "./newsTempOutFiles/" + getRndInteger(999, 999999).toString() + message.channel.id + "x" + ".pdf"
                    var result = await toPDF(undefined, reqLink)
                    fs.writeFile(filename.toString(), result, function (err) {
                        if (err) return console.log(err)
                    })
                    setTimeout(() => {
                        message.channel.send({ files: [filename] })
                    }, 700);
                    setTimeout(() => {
                        fs.unlink(filename, (err) => {
                            if (err) console.log(err)
                            console.log(`${filename} was deleted.`)
                        })
                    }, 1700);
                } else {
                    if (mediaProfiles[reqLinkParsed.domain].ua != "") {
                        userAgent = mediaProfiles[reqLinkParsed.domain].ua
                    }
                    if (mediaProfiles[reqLinkParsed.domain].xforwardedfor != "") {
                        xforwardedfor = mediaProfiles[reqLinkParsed.domain].xforwardedfor
                    }
                    if (mediaProfiles[reqLinkParsed.domain].referer != "") {
                        if (mediaProfiles[reqLinkParsed.domain].referer != "none") {
                            referer = mediaProfiles[reqLinkParsed.domain].referer
                        } else if (mediaProfiles[reqLinkParsed.domain].referer === "none") {
                            referer = ""
                        }
                    }
                }
            }
        }

        client.logger.log('info', `get (media) command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild} args: ${args} | link: ${reqLink} useragent: ${userAgent} | xforward ip: ${xforwardedfor}`)


        if (getrequest === true) {
            message.channel.send(`GET with ${reqLink} using useragent: ${userAgent} | X-Forwarded-For: ${xforwardedfor} | Referer: ${referer}`)
            superagent
                // .get(`https://www.foreignaffairs.com/articles/china/2011-08-19/inevitable-superpower`)
                // .get(`https://www.wsj.com/articles/discord-ends-deal-talks-with-microsoft-11618938806`)
                .get(reqLink)
                .set("Cache-Control", "no-cache")
                .set('User-Agent', userAgent)
                .set("Accept", "*/*")
                // .set("Accept-Encoding", acceptEncoding) // - might need this later so i am leaving this here, broken on the economist.com & warontherocks.com
                .set("Connection", "keep-alive")
                .set("X-Forwarded-For", xforwardedfor)
                .set("Referer", referer)
                .end(async (err, res) => {
                    var filename = "./newsTempOutFiles/" + getRndInteger(999, 999999).toString() + message.channel.id + "x" + ".pdf"
                    var htmlCleaning = res.text.replace(/<input/g, "<blank").replace(/<svg viewBox="0 0 24 24"/g, "<blank")
                    if (mediaProfiles[reqLinkParsed.domain] != undefined) {
                        if (mediaProfiles[reqLinkParsed.domain].htmlErase != undefined) {
                            // var regex = new RegExp(`${mediaProfiles[reqLinkParsed.domain].htmlErase}`, 'g')
                            console.log(mediaProfiles[reqLinkParsed.domain].htmlErase)
                            htmlCleaning = htmlCleaning.replace(mediaProfiles[reqLinkParsed.domain].htmlErase, "<blank")
                        }
                    }
                    var result = await toPDF(htmlCleaning)
                    fs.writeFile(filename.toString(), result, function (err) {
                        if (err) return console.log(err)
                    })
                    setTimeout(() => {
                        message.channel.send({ files: [filename] })
                    }, 700);
                    setTimeout(() => {
                        fs.unlink(filename, (err) => {
                            if (err) console.log(err)
                            console.log(`${filename} was deleted.`)
                        })
                    }, 1700);
                })
        }
        async function toPDF(html, link) {
            const browser = await puppeteer.launch({ headless: true, defaultViewport: null });
            const page = await browser.newPage();

            if (link != undefined) {
                console.log(`going ${link}`)
                await page.goto(link)
                await page.waitForTimeout(2000)
            } else if (link === undefined) {
                await page.setContent(html)
            }

            const pdf = await page.pdf({
                format: 'Letter', margin: {
                    left: '2.54cm',
                    top: '2.54cm',
                    right: '2.54cm',
                    bottom: '2.54cm'
                }
            });

            await browser.close();
            return pdf
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
                    var found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)
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
                                    found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)
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

// ARCHIVAL2: 
 // console.log(args.join(' '))
                // pyshell.send(args.join(' '));
                // pyshell.on('message', function (message) {
                //     // received a message sent from the Python script (a simple "print" statement)
                //     console.log(message);
                // });

                // // end the input stream and allow the process to exit
                // pyshell.end(function (err, code, signal) {
                //     if (err) throw err;
                //     console.log('The exit code was: ' + code);
                //     console.log('The exit signal was: ' + signal);
                //     console.log('finished');
                //     console.log('finished');
                // });
                // scholar rate limited by google :(

// ARCHIVAL1:

 // // message.reply(`Not found on sci-hub!`)
                // // return
                // console.log("WOOO")
                // // PythonShell.run('./script.py', null, function (err, results) {
                // //     if (err) throw err;
                // //     console.log('finished');
                // //     console.log(results)
                // //     // console.log(results.)
                // // });
                // pyshell.send(args.join(' '))
                // console.log("sent....")
                // pyshell.on('message', function (msg) {
                //     // eprint = msg;
                //     console.log(msg)
                //     // console.log(message.indexOf("eprint"))
                //     // callback(msg)
                //     // if (msg.indexOf("eprint") != -1) {

                //     //     eprint = msg.substring(msg.indexOf('eprint'))
                //     //     // return eprint
                //     //     console.log(eprint)
                //     // }
                // });
                // // message.channel.send(eprint)
                // // console.log(eprint)

                // // eprint = runPy(args.join(' '))
                // // function runPy(data){
                // //     return new Promise((resolve, reject) => {
                // //       let result;
                // //       let pyshell = new PythonShell('script.py'); // , {mode: 'text', args: [date]}

                // //       pyshell.send(data);

                // //       pyshell.on('message', function (message) {
                // //         // result = JSON.parse(message);
                // //         result = message;
                // //       });

                // //       pyshell.on('stderr', function (stderr) {
                // //         console.log(stderr);
                // //       });

                // //       pyshell.end(function (err, code, signal) {
                // //         if (err) reject(err);
                // //         console.log('The exit code was: ' + code);
                // //         console.log('The exit signal was: ' + signal);
                // //         console.log('finished');
                // //         resolve(result);
                // //       });
                // //     });
                // //   }
