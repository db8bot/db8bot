const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios').default
const qs = require('qs')
const Discord = require('discord.js')
const ddos = require('@db8bot/ddosguard-bypass')
const cheerio = require('cheerio')
const redis = require('redis')
var cache = redis.createClient({
    url: `redis://${process.env.SCIHUBREDISURL}`,
    password: process.env.SCIHUBREDISPASSWORD
})

async function buildEmbed(err, res, interaction, search) {
    const jstorEmbed = new Discord.MessageEmbed()
        .setColor('#8b0000')
        .setTimestamp(new Date())
    if (!err) {
        const authors = res[1].authors.map(author => author.given + ' ' + author.family).join(', ')
        jstorEmbed.setTitle((res[1].title) ? res[1].title : 'Requested Article (No Title)')
        jstorEmbed.setDescription('[Access Article](' + res[0] + ')')
        jstorEmbed.setURL(res[0])
        jstorEmbed.addField('Journal/Container', (res[1].containerTitle) ? res[1].containerTitle : 'No Container Title')
        jstorEmbed.addField('DOI', (res[1].doi) ? res[1].doi : 'No DOI')
        jstorEmbed.addField('Issued Year', (res[1].issuedYear) ? '' + res[1].issuedYear : 'No Issue Year', true)
        jstorEmbed.addField('Issued Month', (res[1].issuedMonth) ? '' + res[1].issuedMonth : 'No Issue Month', true)
        jstorEmbed.addField('Volume', (res[1].volume) ? res[1].volume : 'No Volume #')
        jstorEmbed.addField('Issue', (res[1].issue) ? res[1].issue : 'No Issue #', true)
        jstorEmbed.addField('Author(s)', authors)
        jstorEmbed.addField('Original Query', search)
        jstorEmbed.setFooter({
            text: `Requested by ${interaction.user.tag}`,
            icon_url: interaction.user.avatarURL()
        })
    } else {
        jstorEmbed.setTitle('Error')
        jstorEmbed.setDescription('No results found. If the article has a DOI, you should try using that (both the doi.org link and just the DOI). You should also try setting the paper\'s title as the source. Sometimes an journal/article is stored under different identifiers in the database.\nIf you are searching a book, use `/getbook`, if you are trying to get a news article from the press, use `/getmedia.`')
    }
    return (jstorEmbed)
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get')
        .setDescription('unlock research paywalls')
        .addStringOption(option =>
            option.setName('source')
                .setDescription('link with doi, doi number OR title of research')
                .setRequired(true)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        await cache.connect()
        console.log('redis connected')
        // get search from input
        const input = interaction.options.getString('source')

        // regex match doi or the title of paper
        var search = input.match(/\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&'<>])\S)+)\b/gm)
        if (search === null) search = input
        else search = search[0]
        const jstor = input.includes('jstor.org/stable')

        // check cache first
        if (await cache.exists(search)) {
            const result = JSON.parse(await cache.get(search))
            interaction.reply({ content: 'Got it! Click the blue title to access or click "Access Article". A PDF is provided if you wish to download the article.', embeds: [await buildEmbed(false, result, interaction, search)], files: [{ attachment: result[0], name: (result[1].title) ? `${result[1].title}.pdf` : 'Requested Article.pdf' }] })
            cache.disconnect()
        } else { // if non jstor, request to scihub directly with ddos-bypass, else request to CFworkers api via /paper
            await interaction.reply('Fetching...')
            if (jstor) { // req to blaze api + redis cache the results here
                axios.post('https://db8bot-scihub-api.airfusion.workers.dev/paper', qs.stringify({
                    query: search
                }), {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }).then(async (res) => {
                    interaction.fetchReply().then(async () => {
                        interaction.editReply({ content: 'Got it! Click the blue title to access or click "Access Article". A PDF is provided if you wish to download the article.', embeds: [await buildEmbed(res.status !== 200, res.data, interaction, search)], files: [{ attachment: res.data[0], name: (res.data[1].title) ? `${res.data[1].title}.pdf` : 'Requested Article.pdf' }] })
                    })
                    // add to cache
                    await cache.set(search, JSON.stringify(res.data), {
                        EX: 86400 // 1 day
                    })
                    console.log('added to cache')
                    cache.disconnect()
                }).catch(async (err) => {
                    console.log(err)
                    interaction.fetchReply().then(async () => {
                        interaction.editReply({ embeds: [await buildEmbed(true, null, null, null)] })
                    })
                    cache.disconnect()
                })
            } else { // not jstor - request scihub directly & metadata from blaze api
                ddos.bypass('https://sci-hub.se', function (err, resp) {
                    if (err) {
                        console.log('error getting cookies', err)
                        interaction.fetchReply().then(async () => {
                            interaction.editReply({ embeds: [await buildEmbed(true, null, null, null)] })
                        })
                    } else {
                        const normalHeaders = {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Cache-Control': 'no-cache',
                            'User-Agent': resp['headers']['user-agent'],
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Connection': 'keep-alive',
                            'Host': 'sci-hub.se',
                            'Referer': resp['headers']['referer'],
                            'Origin': 'https://sci-hub.se',
                            'Cookie': resp['cookies']['string']
                        }

                        Promise.all([axios({
                            method: 'POST',
                            url: 'https://sci-hub.se',
                            data: qs.stringify({ request: search }),
                            headers: normalHeaders
                        }), axios({
                            method: 'POST',
                            url: 'https://db8bot-scihub-api.airfusion.workers.dev/paper',
                            data: qs.stringify({ query: search }),
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        })]).then(async (res) => {
                            const res1 = res[0]
                            const res2 = res[1]
                            const $ = cheerio.load(res1.data)
                            var matching
                            try {
                                matching = $($('#article').children('embed')[0]).attr('src') || $($('#article').children('iframe')[0]).attr('src')
                                if (!matching.includes('https://') && matching.includes('http://')) matching = matching.replace('http://', 'https://')
                                if (!matching.includes('https://') && !matching.includes('http://') && matching.includes('//')) matching = matching.replace('//', 'https://')
                                if (matching.indexOf('/') === 0 && !matching.includes('//') && !matching.includes('sci-hub.se')) matching = `https://sci-hub.se${matching}`

                                if (matching) {
                                    interaction.fetchReply().then(async () => {
                                        interaction.editReply({ content: 'Got it! Click the blue title to access or click "Access Article". A PDF is provided if you wish to download the article.', embeds: [await buildEmbed((res1.status !== 200 || res2.status !== 200), [matching, res2.data], interaction, search)], files: [{ attachment: matching, name: (res2.data.title) ? `${res2.data.title}.pdf` : 'Requested Article.pdf' }] })
                                    })
                                    // add to cache
                                    await cache.set(search, JSON.stringify([matching, res2.data]), {
                                        EX: 86400 // 1 day
                                    })
                                    console.log('added to cache')
                                    cache.disconnect()
                                }
                            } catch (e) {
                                interaction.fetchReply().then(async () => {
                                    interaction.editReply({ embeds: [await buildEmbed(true, null, null, null)] })
                                })
                                cache.disconnect()
                            }
                        })
                    }
                })
            }
        }
    }
}
