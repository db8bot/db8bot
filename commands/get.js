const { hostname } = require('os');
const { options } = require('superagent');

exports.run = function (client, message, args) {
    const superagent = require('superagent');
    require('superagent-proxy')(superagent);
    const querystring = require('querystring');
    var scholar = require('google-scholar-link')
    const Discord = require('discord.js');
    const { http, https } = require('follow-redirects');
    const config = client.config
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
        .proxy(config.proxy)
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
                            .proxy(config.proxy)
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
