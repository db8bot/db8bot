const child_process = require('child_process')
const psl = require('psl')
const mediaProfilesAllowCookies = require('./getFiles/mediaProfilesAllowCookies.json') // dont remove before page load - if not in the remove after page load, the cookie is kept
const mediaProfilesRemoveCookies = require('./getFiles/mediaProfilesRemoveCookies.json') // remove after page load
const mediaProfilesRemoveAllExcept = require('./getFiles/mediaProfilesRemoveAllExcept.json')
const mediaProfilesRemove = require('./getFiles/mediaProfilesRemove.json')
const googleBotList = require('./getFiles/googleBot.json')
const bingBotList = require('./getFiles/bingBot.json')
const mediaProfilesAmp = require('./getFiles/mediaProfilesAMP.json')
const blockedPageReqRegexes = require('./getFiles/mediaProfilesBlockedPageReqRegex')
const mediaProfilesDisableJS = require('./getFiles/mediaProfilesDisableJS.json')
// const useOutline = require('../getFiles/useOutline.json')
var uas = {
    google: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    bing: "'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'"
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// var url = 'https://www.bloomberg.com/news/articles/2021-06-13/a-meme-stock-is-born-how-to-spot-the-next-reddit-favorite'
// var url = 'https://www.nytimes.com/2021/11/25/business/retail-vaccine-mandates.html'
// var url = 'https://www.wsj.com/articles/what-inflation-small-investors-keep-piling-into-flashy-growth-stocks-11637836200?mod=hp_lead_pos1'

// var filename = './newsTempOutFiles/' + getRndInteger(999, 999999).toString() + 'interaction.channelId' + 'x' + '.pdf'
var filename = './newsTempOutFiles/' + getRndInteger(999, 999999).toString() + 'interaction.channelId' + 'x' + '.mhtml'
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
    disableJS: mediaProfilesDisableJS.some(str => str.includes(urlParsed.domain))
}
console.log(options)
// message.channel.send(`OPTIONS:\nallowCookies: ${options.allowCookies}\nremoveCookiesAfterLoad: ${options.removeCookiesAfterLoad}\nremoveAllCookiesExcept: ${options.removeAllCookiesExcept}\nremoveCertainCookies: ${options.removeCertainCookies}\nBot: ${options.bot}\nUseragent UA: ${options.ua}\nAMP?: ${options.amp}\nblockedPageReqRegex: \`${options.blockedPageReqRegex}\`\nGive it a second, it might be slow...`)

if (options.amp !== undefined && options.amp !== '') {
    url = url.replace(urlParsed.domain, options.amp).replace('www.', '') // make sure we go to the amp site if it has the amp flag
}

// const pdfChildProcess = child_process.fork('./childFiles/getPDFChild.js')
const pdfChildProcess = child_process.fork('./modules/getPDFChildNew.js')
// // console.log(new RegExp(options.blockedPageReqRegex))

pdfChildProcess.send({
    link: url,
    ua: ua,
    // reg: urlParsed.domain,
    // allowCookies: options.allowCookies,
    // removeCookiesAfterLoad: options.removeCookiesAfterLoad,
    // removeAllCookiesExcept: options.removeAllCookiesExcept,
    // removeCertainCookies: options.removeCertainCookies,
    // disableJS: options.disableJS,
    filename: filename.toString()
})


pdfChildProcess.on('close', async (code) => {
    console.log(`exited with code ${code}`)
})