exports.run = async function (client, message, args) {
    const superagent = require('superagent')
    const cheerio = require('cheerio')
    // require('superagent-proxy')(superagent);
    const Discord = require('discord.js')
    const config = process.env
    const child_process = require('child_process')
    const googleBotList = require('../getFiles/googleBot.json')
    const bingBotList = require('../getFiles/bingBot.json')
    const mediaProfilesAmp = require('../getFiles/mediaProfilesAMP.json')
    var uas = {
        google: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        bing: "'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'"
    }
    const psl = require('psl')
    const fs = require('fs')
    const fsp = fs.promises
    const IPFS = require('ipfs')
    const MongoClient = require('mongodb').MongoClient
    const database = new MongoClient(config.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
    const mhtml2html = require('mhtml2html')
    const { JSDOM } = require('jsdom')

    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    if (args.join(' ') === '' || args.join(' ').indexOf('http') === -1) {
        const help = new Discord.MessageEmbed()
            .setColor('#f0ffff')
            .setDescription('**Command: **' + `${config.PREFIX}get - USE SLASH COMMANDS FOR A MORE ADVANCED VERSION OF THIS COMMAND W/ BOOK UNLOCKS`)
            .addField('**Usage:**', `${config.PREFIX}get <research report link/doi link>`)
            .addField('**Usage 2:**', `${config.PREFIX}get m <media link, ex: nytimes.com>`)
            .addField('**Example:**', `${config.PREFIX}get https://www.doi.org/10.2307/1342499/`)
            .addField('**Example 2:**', `${config.PREFIX}get m https://www.bloomberg.com/news/articles/2021-06-13/a-meme-stock-is-born-how-to-spot-the-next-reddit-favorite`)
            .addField('**Expected Result From Example:**', 'Bot will search sci-hub for the specified document. If it is found, it will return a PDF to the channel. If PDF is too large, the PDF link will be sent.')
            .addField('**Expected Result From Example 2:**', 'Bot will return a PDF file that contians the unlocked content. This feature is in beta & may not always work on all media sites.')
        message.channel.send({ embeds: [help] })
        return
    }
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    if ((args[0].toLowerCase() != 'r') && (args[0].toLowerCase() === 'm')) {
        var url = args.pop()
        database.connect(async (err, dbClient) => {
            if (err) console.error(err)
            const collection = dbClient.db('db8bot').collection('ipfsKeys')
            var dbResults = await collection.find({ link: url }).toArray()
            if (dbResults[0] !== undefined) { // there is a result from mongo! send ipfs link instead of forking
                message.channel.send(`https://cloudflare-ipfs.com/ipfs/${dbResults[0].path}`)
                database.close()
            } else { // open child process to generate pdf
                database.close()
                message.channel.send('Job added to paywall unlock queue. This may take a few minutes. It will return an HTML file. Download using the button on the bottom right & open in any major browser.')
                // var filename = './newsTempOutFiles/' + getRndInteger(999, 999999).toString() + interaction.channelId + 'x' + '.mhtml'
                var filename = './newsTempOutFiles/' + getRndInteger(999, 999999).toString() + message.channel.id + 'x' + '.html'
                var urlParsed = psl.parse(url.replace('https://', '').replace('http://', '').split('/')[0])

                if (googleBotList.some(str => str.includes(urlParsed.domain))) {
                    var ua = uas.google
                } else if (bingBotList.some(str => str.includes(urlParsed.domain))) {
                    var ua = uas.bing
                } else {
                    var ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4538.0 Safari/537.36'
                }

                if (mediaProfilesAmp[urlParsed.domain] !== undefined && mediaProfilesAmp[urlParsed.domain] !== '') {
                    url = url.replace(urlParsed.domain, mediaProfilesAmp[urlParsed.domain]).replace('www.', '') // make sure we go to the amp site if it has the amp flag
                }

                const pdfChildProcess = child_process.fork('./modules/getPDFChild.js')

                pdfChildProcess.send({
                    link: url,
                    ua: ua,
                    filename: filename.toString()
                })

                pdfChildProcess.on('message', async (mhtml) => {
                    // console.log(`exited with code ${code}`)
                    console.log('received')
                    pdfChildProcess.disconnect()
                    const htmldoc = await mhtml2html.convert(mhtml, { parseDOM: (html) => new JSDOM(html) })
                    await fsp.writeFile(filename.toString(), htmldoc.serialize())
                    await message.channel.send({ files: [filename] })
                    var readStream = fs.createReadStream(filename)
                    const ipfsNode = await IPFS.create()
                    const results = await ipfsNode.add(readStream)

                    // write key to mongo
                    database.connect(async (err, dbClient) => {
                        if (err) console.error(err)
                        const collection = dbClient.db('db8bot').collection('ipfsKeys')
                        collection.insertOne({
                            link: url,
                            path: results.path
                        }, function (err, res) {
                            if (err) console.error(err)
                            database.close()
                        })
                        console.log('inserted')
                    })
                    try {
                        await fsp.rm(filename)
                    } catch (e) {
                        if (e) console.error(e)
                    }
                })
            }
        })
    }
    // sci hub section below
    else {
        var link = args.join(' ')
        superagent
            .get(`https://sci-hub.se/${link}`)
            // .get(`https://sci-hub.se/https://www.doi.org/10.2307/1342499/`)
            .set('Cache-Control', 'no-cache')
            .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36')
            .set('Accept', '*/*')
            .set('Accept-Encoding', 'gzip, deflate, br')
            .set('Connection', 'keep-alive')
            .set('Host', 'sci-hub.se')
            .redirects(2)
            .end((err, res) => {
                var foundSciHubLink
                if (err) foundSciHubLink = null
                try {
                    foundSciHubLink = res.text.match(/src="(.*?)" id = "pdf"/)
                } catch (err) {
                    foundSciHubLink = null
                }
                if (foundSciHubLink != null) { // there is a scihub pdf - send it!
                    if (foundSciHubLink[1].indexOf('https') === -1) {
                        foundSciHubLink[1] = 'https:' + foundSciHubLink[1]
                    }
                    try {
                        message.channel.send(foundSciHubLink[1])
                        message.channel.send({
                            files: [foundSciHubLink[1] + '.pdf']
                        })
                    } catch (e) {
                        console.error(e)
                    }
                } else { // if scihub pdf doesnt exist
                    // check if scihub is libgen page
                    if (res.text.includes('libgen')) { // libgen page
                        var libgenSection = res.text.substring(res.text.indexOf('<td colspan=2>') + 14, res.text.indexOf('</a></b></td>'))
                        libgenSection = libgenSection.substring(libgenSection.indexOf('<b><a href=\'') + 12, libgenSection.indexOf('\'>'))
                        message.channel.send(`Document on libgen - Mirror selection page: ${res.request.url}\nWorking Download Mirror Link: ${libgenSection}`)
                    } else {
                        // check for google scholar
                        superagent
                            .get(`https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(link)}`)
                            .redirects(3)
                            .end((err, resScholar) => {
                                if (err) console.error(err)
                                var $ = cheerio.load(resScholar.text)
                                if ($($('#gs_res_ccl').children()[1]).children().length === 1) { // there is only 1 google scholar entry - see if that has a pdf.
                                    if ($($($('#gs_res_ccl').children()[1]).children('div')[0]).children().length >= 2) { // 2 means there is a pdf. the pdf link element is the 1st div
                                        // var scholarPDFLink = $($($($($('#gs_res_ccl').children()[1]).children('div')[0]) // deployment, use [1] on the last element for dev
                                        var scholarPDFLink = $($($($($($('#gs_res_ccl').children()[1]).children('div')[0]).children()[0]).children()[0]).children()[0]).children('a').attr('href')
                                        message.channel.send(scholarPDFLink)
                                    } else { // no pdf found on google scholar. checking page's html & filtering doi & trying scihub on that.
                                        if (!link.includes('doi.org')) {
                                            superagent
                                                .get(link)
                                                .redirect(3)
                                                .end((err, res) => {
                                                    if (err) console.error(err)
                                                    var foundDoi = res.text.match(/doi.org\/\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&'<>])\S)+)\b/gm) // find doi in page, and search for that doi
                                                    superagent
                                                        .get(`https://sci-hub.se/${foundDoi}`)
                                                        .set('Cache-Control', 'no-cache')
                                                        .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36')
                                                        .set('Accept', '*/*')
                                                        .set('Accept-Encoding', 'gzip, deflate, br')
                                                        .set('Connection', 'keep-alive')
                                                        .set('Host', 'sci-hub.se')
                                                        .redirects(2)
                                                        .end((err, resRecursiveDoiSearch) => {
                                                            if (err) console.err(err)
                                                            try {
                                                                foundSciHubLink = resRecursiveDoiSearch.text.match(/src="(.*?)" id = "pdf"/)
                                                            } catch (err) {
                                                                foundSciHubLink = null
                                                            }
                                                            if (foundSciHubLink != null) {
                                                                if (foundSciHubLink[1].indexOf('https') === -1) {
                                                                    foundSciHubLink[1] = 'https:' + foundSciHubLink[1]
                                                                }
                                                                try {
                                                                    message.channel.send(foundSciHubLink[1])
                                                                    message.channel.send({
                                                                        files: [foundSciHubLink[1] + '.pdf']
                                                                    })
                                                                } catch (e) {
                                                                    console.error(e)
                                                                }
                                                            } else {
                                                                superagent
                                                                    .get(`https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(link)}`)
                                                                    .redirects(3)
                                                                    .end((err, resRecursiveScholarSearch) => {
                                                                        if (err) console.error(err)
                                                                        var $ = cheerio.load(resRecursiveScholarSearch.text)
                                                                        if ($($('#gs_res_ccl').children()[1]).children().length === 1) {
                                                                            if ($($($('#gs_res_ccl').children()[1]).children('div')[0]).children().length >= 2) { // 2 means there is a pdf. the pdf link element is the 1st div
                                                                                // var scholarPDFLink = $($($($($('#gs_res_ccl').children()[1]).children('div')[0]) // deployment, use [1] on the last element for dev
                                                                                var scholarPDFLink = $($($($($($('#gs_res_ccl').children()[1]).children('div')[0]).children()[0]).children()[0]).children()[0]).children('a').attr('href')
                                                                                message.channel.send(scholarPDFLink)
                                                                            } else {
                                                                                message.channel.send('Not found.')
                                                                            }
                                                                        } else if ($($('#gs_res_ccl').children()[1]).children().length < 1) {
                                                                            message.channel.send('Not found')
                                                                        } else {
                                                                            message.channel.send(`Multiple google scholar entries. See this link: https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(link)}`)
                                                                        }
                                                                    })
                                                            }
                                                        })
                                                })
                                        } else {
                                            message.channel.send('Not found')
                                        }
                                    }
                                } else if ($($('#gs_res_ccl').children()[1]).children().length < 1) { // no google scholar entries
                                    message.channel.send('Not found')
                                } else {
                                    message.channel.send(`Multiple google scholar entries. See this link: https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(link)}`)
                                }
                            })
                    }
                }
            })
    }
}
