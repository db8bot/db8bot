const { SlashCommandBuilder } = require('@discordjs/builders')
const superagent = require('superagent')
const cheerio = require('cheerio')
const Discord = require('discord.js')
const psl = require('psl')
const util = require('util')
const fs = require('fs')
const fsp = fs.promises
const IPFS = require('ipfs')
const MongoClient = require('mongodb').MongoClient
// eslint-disable-next-line camelcase
const child_process = require('child_process')
// const mediaDomains = require('../getFiles/mediaDomains.json')
const mediaProfilesAllowCookies = require('../getFiles/mediaProfilesAllowCookies.json') // dont remove before page load - if not in the remove after page load, the cookie is kept
const mediaProfilesRemoveCookies = require('../getFiles/mediaProfilesRemoveCookies.json') // remove after page load
const mediaProfilesRemoveAllExcept = require('../getFiles/mediaProfilesRemoveAllExcept.json')
const mediaProfilesRemove = require('../getFiles/mediaProfilesRemove.json')
const googleBotList = require('../getFiles/googleBot.json')
const bingBotList = require('../getFiles/bingBot.json')
const mediaProfilesAmp = require('../getFiles/mediaProfilesAMP.json')
const blockedPageReqRegexes = require('../getFiles/mediaProfilesBlockedPageReqRegex')
const mediaProfilesDisableJS = require('../getFiles/mediaProfilesDisableJS.json')
const useOutline = require('../getFiles/useOutline.json')
var uas = {
    google: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    bing: "'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'"
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('get')
        .setDescription('unlock research & news paywalls')
        .addStringOption(option =>
            option.setName('flags')
                .setDescription('optional flags for the command. use m for news/media paywalls')
                .addChoice('media', 'm')
                .addChoice('book', 'b')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('source')
                .setDescription('link to the paper or news article or ISBN/book name to unlock')
                .setRequired(false)
        ),
    async execute(interaction) {
        interaction.client.logger.log('info', `get command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const config = interaction.client.config
        const uri = `mongodb+srv://${config.MONGOUSER}:${config.MONGOPASS}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const flag = interaction.options.getString('flags')
        const link = interaction.options.getString('source')
        if (flag !== 'm' && flag !== 'b') {
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
                    if (foundSciHubLink != null) {
                        if (foundSciHubLink[1].indexOf('https') === -1) {
                            foundSciHubLink[1] = 'https:' + foundSciHubLink[1]
                        }
                        try {
                            interaction.reply(foundSciHubLink[1])
                            interaction.channel.send({
                                files: [foundSciHubLink[1] + '.pdf']
                            })
                        } catch (e) {
                            console.error(e)
                        }
                    } else {
                        // check if scihub is libgen page
                        if (res.text.includes('libgen')) { // libgen page
                            var libgenSection = res.text.substring(res.text.indexOf('<td colspan=2>') + 14, res.text.indexOf('</a></b></td>'))
                            libgenSection = libgenSection.substring(libgenSection.indexOf('<b><a href=\'') + 12, libgenSection.indexOf('\'>'))
                            interaction.reply(`Document on libgen - Mirror selection page: ${res.request.url}\nWorking Download Mirror Link: ${libgenSection}`)
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
                                            interaction.reply(scholarPDFLink)
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
                                                                        interaction.reply(foundSciHubLink[1])
                                                                        interaction.channel.send({
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
                                                                                    interaction.reply(scholarPDFLink)
                                                                                } else {
                                                                                    interaction.reply('Not found.')
                                                                                }
                                                                            } else {
                                                                                interaction.reply(`Multiple google scholar entries. See this link: https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(link)}`)
                                                                            }
                                                                        })
                                                                }
                                                            })
                                                    })
                                            } else {
                                                interaction.reply('Not found')
                                            }
                                        }
                                    } else {
                                        interaction.reply(`Multiple google scholar entries. See this link: https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(link)}`)
                                    }
                                })
                        }
                    }
                })
        } else if (flag === 'b') { // search libgen
            superagent
                .get(`https://libgen.is/search.php?req=${encodeURIComponent(link)}&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def`)
                .redirects(2)
                .end((err, resLibgen) => {
                    if (err) console.error(err)
                    var $ = cheerio.load(resLibgen.text)
                    var libLolLink = $($($($($('table').children()[2]).children('tr')[1]).children('td')[9]).children('a')[0]).attr('href')
                    superagent
                        .get(libLolLink)
                        .redirects(2)
                        .end((err, ipfsPortal) => {
                            if (err) console.error(err)
                            var $ = cheerio.load(ipfsPortal.text)
                            interaction.reply($($($($('#download').children('ul')[0]).children('li')[0]).children('a')[0]).attr('href'))
                        })
                })
        } else if (flag === 'm') {
            var url = link
            database.connect(async (err, dbClient) => {
                if (err) console.error(err)
                const collection = dbClient.db('db8bot').collection('ipfsKeys')
                var dbResults = await collection.find({ link: link }).toArray()
                if (dbResults[0] !== undefined) { // there is a result from mongo! send ipfs link instead of forking
                    interaction.reply(`https://cloudflare-ipfs.com/ipfs/${dbResults[0].path}`)
                    database.close()
                } else { // open child process to generate pdf
                    database.close()
                    var filename = './newsTempOutFiles/' + getRndInteger(999, 999999).toString() + interaction.channelId + 'x' + '.pdf'
                    var urlParsed = psl.parse(url.replace('https://', '').replace('http://', '').split('/')[0])
                    if (googleBotList.some(str => str.includes(urlParsed.domain))) {
                        var ua = uas.google
                    } else if (bingBotList.some(str => str.includes(urlParsed.domain))) {
                        var ua = uas.bing
                    } else {
                        var ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4538.0 Safari/537.36'
                    }
                    var options = { // flags
                        allowCookies: mediaProfilesAllowCookies.some(str => str.includes(urlParsed.domain)),
                        removeCookiesAfterLoad: mediaProfilesRemoveCookies.some(str => str.includes(urlParsed.domain)),
                        removeAllCookiesExcept: mediaProfilesRemoveAllExcept[urlParsed.domain],
                        removeCertainCookies: mediaProfilesRemove[urlParsed.domain],
                        bot: googleBotList.some(str => str.includes(urlParsed.domain)) ? 'google' : bingBotList.some(str => str.includes(urlParsed.domain)) ? 'bing' : '',
                        ua: ua,
                        amp: mediaProfilesAmp[urlParsed.domain],
                        blockedPageReqRegex: blockedPageReqRegexes[urlParsed.domain],
                        disableJS: mediaProfilesDisableJS.some(str => str.includes(urlParsed.domain)),
                        outline: useOutline.some(str => str.includes(urlParsed.domain))
                    }
                    console.log(options)
                    interaction.reply('Give it a second, it might be slow...')
                    // message.channel.send(`OPTIONS:\nallowCookies: ${options.allowCookies}\nremoveCookiesAfterLoad: ${options.removeCookiesAfterLoad}\nremoveAllCookiesExcept: ${options.removeAllCookiesExcept}\nremoveCertainCookies: ${options.removeCertainCookies}\nBot: ${options.bot}\nUseragent UA: ${options.ua}\nAMP?: ${options.amp}\nblockedPageReqRegex: \`${options.blockedPageReqRegex}\`\nGive it a second, it might be slow...`)

                    if (options.amp !== undefined && options.amp !== '') {
                        url = url.replace(urlParsed.domain, options.amp).replace('www.', '') // make sure we go to the amp site if it has the amp flag
                    }

                    const pdfChildProcess = child_process.fork('./childFiles/getPDFChild.js')
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
                            interaction.channel.send(outlineLink)
                        })
                    } else {
                        pdfChildProcess.on('close', async (code) => {
                            console.log(`exited with code ${code}`)
                            await interaction.channel.send({ files: [filename] })
                            var readStream = fs.createReadStream(filename)
                            const ipfsNode = await IPFS.create()
                            const results = await ipfsNode.add(readStream)
                            // write key to mongo
                            database.connect(async (err, dbClient) => {
                                if (err) console.error(err)
                                const collection = dbClient.db('db8bot').collection('ipfsKeys')
                                collection.insertOne({
                                    link: link,
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
                }
            })
        }
    }
}
