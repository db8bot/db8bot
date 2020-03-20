exports.run = function (client, message, args) {

    const superagent = require('superagent');

    superagent
        .get(`https://sci-hub.tw/${args.join(' ')}`)
        .end((err, res) => {
            // Calling the end function will send the request
            var found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)
            message.channel.send(found[1])

        });

}