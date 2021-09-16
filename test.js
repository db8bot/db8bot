const superagent = require('superagent')
const cheerio = require('cheerio')

superagent
    .get(`https://libgen.is/search.php?req=9780691201009&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def`)
    .redirects(2)
    .end((err, resLibgen) => {
        if (err) console.error(err)
        var $ = cheerio.load(resLibgen.text)
        var libLolLink = $($($($($('table').children()[2]).children('tr')[1]).children('td')[9]).children('a')[0]).attr('href')
        console.log($($($($($('table').children()[2]).children('tr')[1]).children('td')[9]).children('a')[0]).attr('href'))
        superagent
            .get(libLolLink)
            .redirects(2)
            .end((err, ipfsPortal) => {
                if (err) console.error(err)
                var $ = cheerio.load(ipfsPortal.text)
                console.log($($($($('#download').children('ul')[0]).children('li')[0]).children('a')[0]).attr('href'))
            })
    })