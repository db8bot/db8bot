const { SlashCommandBuilder } = require('@discordjs/builders')
const MongoClient = require('mongodb').MongoClient
const childProcess = require('child_process')
const googleBotList = require('./getFiles/googleBot.json')
const bingBotList = require('./getFiles/bingBot.json')
const mediaProfilesAmp = require('./getFiles/mediaProfilesAMP.json')
const mhtml2html = require('mhtml2html')
const { JSDOM } = require('jsdom')
const IPFS = require('ipfs')
const fs = require('fs')
const fsp = fs.promises
const psl = require('psl')
const uas = {
    google: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    bing: "'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'"
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getpress')
        .setDescription('Get an article from the press such as NYT. **This feature is in beta & may not work 100%.**')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('link to article')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('recrawl')
                .setDescription('recrawl the article & generate a new file instead of using the old version. Default false.')
                .setRequired(false)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const database = new MongoClient(process.env.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
        var url = interaction.options.getString('link')
        var recrawl = !((interaction.options.getBoolean('recrawl') === null) || (interaction.options.getBoolean('recrawl') === false))

        // regex check if url is valid
        if (!url.match(/^(http|https):\/\/[^ "]+$/gmi)) {
            interaction.reply('Invalid URL. Please try again.')
        } else {
            if (!recrawl) {
                database.connect(async (err, dbClient) => {
                    if (err) console.error(err)
                    const collection = dbClient.db('db8bot').collection('ipfsKeys')
                    var dbResults = await collection.find({ link: url }).toArray()
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

                        const pdfChildProcess = childProcess.fork('./modules/getPDFChild.js')

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
                                        link: url,
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
            } else if (recrawl) {
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

                const pdfChildProcess = childProcess.fork('./modules/getPDFChild.js')

                pdfChildProcess.send({
                    link: url,
                    ua: ua,
                    filename: filename.toString()
                })

                pdfChildProcess.on('message', async (mhtml) => {
                    console.log('received')
                    pdfChildProcess.disconnect()
                    const htmldoc = await mhtml2html.convert(mhtml, { parseDOM: (html) => new JSDOM(html) })
                    await fsp.writeFile(filename.toString(), htmldoc.serialize())
                    await interaction.channel.send({ files: [filename] })
                })
            }
        }
    }
}
