const { SlashCommandBuilder } = require('@discordjs/builders')
const superagent = require('superagent')
const cheerio = require('cheerio')
// var scholar = require('google-scholar-link')
const Discord = require('discord.js')
const psl = require('psl')
const fs = require('fs').promises
// eslint-disable-next-line camelcase
const child_process = require('child_process')
const mediaDomains = require('../getFiles/mediaDomains.json')
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
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
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
            option.setName('link')
                .setDescription('link to the paper or news article')
                .setRequired(false)
        ),
    async execute(interaction) {
        interaction.client.logger.log('info', `get command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const config = interaction.client.config
        var scholarLink = ''
        const flag = interaction.options.getString('flags')
        const link = interaction.options.getString('link')
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
                                                                            var $ = cheerio.load(resRecursiveDoiSearch.text)
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
        }
    }
}
