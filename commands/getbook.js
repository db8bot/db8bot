const { SlashCommandBuilder } = require('@discordjs/builders')
const superagent = require('superagent')
const cheerio = require('cheerio')

async function getIPFSPortal(libgenLolLink) {
    return new Promise((resolve, reject) => {
        superagent
            .get(libgenLolLink)
            .redirects(2)
            .end((err, ipfsPortalLink) => {
                if (err) reject(err)
                var $ = cheerio.load(ipfsPortalLink.text)
                if (ipfsPortalLink.text.includes('Download from an IPFS distributed storage, choose any gateway:')) { // there are ipfs buttons
                    resolve($($($($('#download').children('ul')[0]).children('li')[0]).children('a')[0]).attr('href'))
                } else { // fall back on the slower get link
                    resolve($($('#download').children('h2').children('a')[0]).attr('href'))
                }
            })
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getbook')
        .setDescription('Get a book')
        .addStringOption(option =>
            option.setName('isbn-or-name')
                .setDescription('ISBN or name of book')
                .setRequired(true)

        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Non-fiction or fiction')
                .setRequired(true)
                .addChoice('fiction', 'fiction')
                .addChoice('non-fiction', 'nonfiction')
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)

        const bookType = interaction.options.getString('type')
        const search = interaction.options.getString('isbn-or-name')

        if (bookType === 'fiction') {
            superagent
                .get(`https://libgen.is/fiction/?q=${encodeURIComponent(search)}`)
                .redirects(2)
                .end(async (err, resLibgen) => {
                    if (err) console.error(err)
                    var $ = cheerio.load(resLibgen.text)
                    var libgenLolLink = $($($($($('.catalog tbody').children('tr')[0]).children('td')[5]).children('ul').children('li')[0]).children('a')[0]).attr('href') // lol link of the first mirror of the first entry
                    if (libgenLolLink === undefined) {
                        interaction.reply('Not Found')
                        return
                    }
                    // call getipfsportal func
                    interaction.reply(`${await getIPFSPortal(libgenLolLink)}\nSee the full catalogue at https://libgen.is/fiction/?q=${encodeURIComponent(search)}`)
                })
        } else if (bookType === 'nonfiction') {
            superagent
                .get(`https://libgen.is/search.php?req=${encodeURIComponent(search)}&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def`)
                .redirects(2)
                .end(async (err, resLibgen) => {
                    if (err) console.error(err)
                    var $ = cheerio.load(resLibgen.text)
                    var libgenLolLink = $($($($($('table').children()[2]).children('tr')[1]).children('td')[9]).children('a')[0]).attr('href')
                    if (libgenLolLink === undefined) {
                        interaction.reply('Not found')
                        return
                    }
                    interaction.reply(`${await getIPFSPortal(libgenLolLink)}\nSee the full catalogue at https://libgen.is/search.php?req=${encodeURIComponent(search)}&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def`)
                })
        }
    }
}
