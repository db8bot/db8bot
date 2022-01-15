const { SlashCommandBuilder } = require('@discordjs/builders')
const superagent = require('superagent')
const cheerio = require('cheerio')
const psl = require('psl')
const fs = require('fs')
const fsp = fs.promises
const IPFS = require('ipfs')
const MongoClient = require('mongodb').MongoClient
// eslint-disable-next-line camelcase
const child_process = require('child_process')
// const mediaDomains = require('../getFiles/mediaDomains.json')
const googleBotList = require('../getFiles/googleBot.json')
const bingBotList = require('../getFiles/bingBot.json')
const mediaProfilesAmp = require('../getFiles/mediaProfilesAMP.json')
const mhtml2html = require('mhtml2html')
const { JSDOM } = require('jsdom')
// http://www.smartjava.org/content/using-puppeteer-in-docker-copy-2/
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
        .setDescription('unlock research, news & book paywalls')
        .addStringOption(option =>
            option.setName('source')
                .setDescription('link to the paper or news article or ISBN/book name to unlock')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('flags')
                .setDescription('optional flags: news/media paywalls, books. media-reunlock to get a non-IPFS file for media.')
                .addChoice('media', 'm')
                .addChoice('media-reunlock', 'mf')
                .addChoice('book', 'b')
                .setRequired(false)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const database = new MongoClient(process.env.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
        const flag = interaction.options.getString('flags')
        const link = interaction.options.getString('source')
        if (link === null) {
            interaction.reply('Not Found')
            return
        }
        if (flag !== 'm' && flag !== 'b' && flag !== 'mf') { // not media or books - regular get for papers
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
                            interaction.reply(foundSciHubLink[1])
                            interaction.channel.send({
                                files: [foundSciHubLink[1] + '.pdf']
                            })
                        } catch (e) {
                            console.error(e)
                        }
                    } else { // if scihub pdf doesnt exist
                        // check if scihub is libgen page
                        try {
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
                                                                                        interaction.reply('Not found')
                                                                                    }
                                                                                } else if ($($('#gs_res_ccl').children()[1]).children().length < 1) {
                                                                                    interaction.reply('Not found.\nYou may want to check the title of the paper on Google Scholar. Our search engine frequently gets rate limited by Google.\nIf the link you provided goes to a book, try the /get command again with the "book" flag & the book\'s title or ISBN (10 and 13 - You should try both) as the "source".')
                                                                                } else {
                                                                                    interaction.reply(`Multiple google scholar entries. See this link: https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(link)}`)
                                                                                }
                                                                            })
                                                                    }
                                                                })
                                                        })
                                                } else {
                                                    interaction.reply('Not found.\nYou may want to check the title of the paper on Google Scholar. Our search engine frequently gets rate limited by Google.\nIf the link you provided goes to a book, try the /get command again with the "book" flag & the book\'s title or ISBN (10 and 13 - You should try both) as the "source".')
                                                }
                                            }
                                        } else if ($($('#gs_res_ccl').children()[1]).children().length < 1) {
                                            interaction.reply('Not found.\nYou may want to check the title of the paper on Google Scholar. Our search engine frequently gets rate limited by Google.\nIf the link you provided goes to a book, try the /get command again with the "book" flag & the book\'s title or ISBN (10 and 13 - You should try both) as the "source".')
                                        } else {
                                            interaction.reply(`Multiple google scholar entries. See this link: https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(link)}`)
                                        }
                                    })
                            }
                        } catch (err) {
                            interaction.reply('An unknown error occured. One of the databases for open-access journals may be down. Try with another source if possible.')
                        }
                    }
                })
        } else if (flag === 'b' || /^(?:ISBN(?:-1[03])?:?●)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-●]){3})[-●0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[-●]){4})[-●0-9]{17}$)(?:97[89][-●]?)?[0-9]{1,5}[-●]?[0-9]+[-●]?[0-9]+[-●]?[0-9X]$/gm.test(link)) { // search libgen (triggered by b flag or ISBN regex test)
            superagent
                .get(`https://libgen.is/search.php?req=${encodeURIComponent(link)}&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def`)
                .redirects(2)
                .end((err, resLibgen) => {
                    if (err) console.error(err)
                    var $ = cheerio.load(resLibgen.text)
                    var libLolLink = $($($($($('table').children()[2]).children('tr')[1]).children('td')[9]).children('a')[0]).attr('href')
                    if (libLolLink === undefined) {
                        interaction.reply('Not found. Try chaing the ISBN to 10 or 13 digits or entering the book\'s name.')
                        return
                    }
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
                    interaction.reply('Job added to paywall unlock queue. This may take a few minutes. It will return an HTML file. Download using the button on the bottom right & **open in any major browser.** If nothing is returned, please try again in a few minutes.')
                    // var filename = './newsTempOutFiles/' + getRndInteger(999, 999999).toString() + interaction.channelId + 'x' + '.mhtml'
                    var filename = './newsTempOutFiles/' + getRndInteger(999, 999999).toString() + interaction.channelId + 'x' + '.html'
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
                        await interaction.channel.send({ files: [filename] })
                        try {
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
                                }, async function (err, res) {
                                    if (err) console.error(err)
                                    database.close()
                                    try {
                                        await fsp.rm(filename)
                                    } catch (e) {
                                        if (e) console.error(e)
                                    }
                                    console.log('inserted')
                                })
                            })
                        } catch (err) {
                            console.error(err)
                            console.log('ipfs failed')
                        }
                    })
                }
            })
        } else if (flag === 'mf') {
            var url = link
            interaction.reply('Job added to paywall unlock queue. This may take a few minutes. It will return an HTML file. Download using the button on the bottom right & **open in any major browser.** If nothing is returned, please try again in a few minutes.')
            // var filename = './newsTempOutFiles/' + getRndInteger(999, 999999).toString() + interaction.channelId + 'x' + '.mhtml'
            var filename = './newsTempOutFiles/' + getRndInteger(999, 999999).toString() + interaction.channelId + 'x' + '.html'
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
                await interaction.channel.send({ files: [filename] })
            })
        }
    }
}
