exports.run = function (client, message, args) {

    var JSSoup = require('jssoup').default;
    const superagent = require('superagent');

    superagent
        .get(`https://www.tabroom.com/index/paradigm.mhtml?search_first=${args[0]}&search_last=${args[1]}`)
        .end((err, res) => {
            console.log(args[0])
            console.log(args[1])
            console.log(res)
            var soup = new JSSoup(res);
            // console.log(soup)
            var paraDiv = soup.findAll('div','paradigm')
            console.log(paraDiv.contents)
        })

}