exports.run = function (client, message, args) {

    var JSSoup = require('jssoup').default;
    const superagent = require('superagent');

    superagent
        .get(`https://www.tabroom.com/index/paradigm.mhtml?search_first=${args[0]}&search_last=${args[1]}`)
        .end((err, res) => {
            // console.log(args[0])
            // console.log(args[1])
            // console.log(res.text)
            var soup = new JSSoup(res.text);
            // var soup = new JSSoup(`<html><head></head><body><div class=paradigm><p>hihihi</p></div></body></html>`);
            // console.log(soup)
            var paraDiv = soup.find('div', { 'class': 'paradigm' })
            // var paraDiv = soup.find('span', {'class':'third rightalign semibold bluetext'})
            console.log(paraDiv.nextElement.previousElement.text)
            console.log(paraDiv.nextElement.previousElement.text.length)
            var substrVar = 0;
            var placement = 0;
            try {
                for (var i = 0; i < Math.ceil((paraDiv.nextElement.previousElement.text.length) / 2000); i++) {

                    if (i + 1 === Math.ceil((paraDiv.nextElement.previousElement.text.length) / 2000)) {
                        console.log((paraDiv.nextElement.previousElement.text).substring(substrVar).length)
                        if ((paraDiv.nextElement.previousElement.text).substring(substrVar).length > 1995) {
                            i--;
                        } else {
                            message.channel.send("```" + (paraDiv.nextElement.previousElement.text).substring(substrVar) + "```")
                        }
                    } else {
                        var est = (paraDiv.nextElement.previousElement.text).substring(substrVar + 1994, substrVar + 1996).indexOf(" ")
                        placement = substrVar + 1994
                        if (est === -1) {
                            est = (paraDiv.nextElement.previousElement.text).substring(substrVar + 1985, substrVar + 1996).indexOf(" ")
                            placement = substrVar + 1985
                        }
                        // message.channel.send((paraDiv.nextElement.previousElement.text).substring(substrVar, substrVar+2000))
                        message.channel.send("```" + (paraDiv.nextElement.previousElement.text).substring(substrVar, placement + est) + "```")
                    }
                    // substrVar+=2000;
                    substrVar = est + placement;
                }
            } catch (err) {
                console.log("FSJDFLKSJDLFJSF FALL BACK")
                for (var i = 0; i < Math.ceil((paraDiv.nextElement.previousElement.text.length) / 2000); i++) {
                    if (i + 1 === Math.ceil((paraDiv.nextElement.previousElement.text.length) / 2000)) {
                        message.channel.send((paraDiv.nextElement.previousElement.text).substring(substrVar))
                    } else {
                        message.channel.send((paraDiv.nextElement.previousElement.text).substring(substrVar, substrVar+2000))
                    }
                    substrVar+=2000;
                }
            }
            message.channel.send(`Original Link: https://www.tabroom.com/index/paradigm.mhtml?search_first=${args[0]}&search_last=${args[1]}`)
        })

}