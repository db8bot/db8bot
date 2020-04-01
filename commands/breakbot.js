exports.run = function (client, message, args) {

    const superagent = require('superagent');

    if (message.guild.id != "685646226942984206") return;
    else {
        superagent
            .get(`https://cataas.com/cat`)
            .end((err, res) => {
                if ((Math.floor(Math.random() * Math.floor(5)) === 3)) {
                    message.channel.send({ files: [`./breakbotIMG/${(Math.floor(Math.random() * Math.floor(4)))}.jpg`] })
                } else {
                    message.channel.send({ files: [res.body] });
                    console.log(res.body)
                }
            });

    }
    client.logger.log('info', `breakbot command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${guild}`)
}