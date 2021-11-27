// fix quote file translation
const quoteFilePath = '../quoteFiles/foucaultQuote.json'
const quoteFile = require(quoteFilePath)
const translate = require('@vitalets/google-translate-api')
const fs = require('fs')

async function run() {
    for (i = 0; i < quoteFile.length; i++) {
        if (!(/^[\x00-\x7F—–‘’“”…]*$/.test(quoteFile[i].quote))) { // need to translate
            console.log('translating')
            console.log(`original: ${quoteFile[i].quote}`)
            console.log(`original: ${/^[\x00-\x7F—–‘’“”…]*$/.test(quoteFile[i].quote)}`)
            var res = await translate(quoteFile[i].quote, { to: 'en' })
            quoteFile[i].original = quoteFile[i].quote
            quoteFile[i].quote = res.text
            quoteFile[i].translated = true
        }
    }
    fs.writeFileSync(quoteFilePath, JSON.stringify(quoteFile, null, 2))
}

run()