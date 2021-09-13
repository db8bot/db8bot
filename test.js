const superagent = require('superagent')
const cheerio = require('cheerio')

superagent
    .get(`https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=Confronting+the+Nation%27s+Water+Problems&btnG=`)
    .end((err, res) => {
        const $ = cheerio.load(res.text)
        console.log($($('#gs_res_ccl').children()[1]).children().length)
        console.log($($($('#gs_res_ccl').children()[1]).children('div')[0]).children().length)
        console.log($($($('#gs_res_ccl').children()[1]).children('div')[1]).children().length)
    })