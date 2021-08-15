exports.run = function (client, message) {

    const superagent = require('superagent');
    var guild = message.guild;
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    }
    if (message.guild.id != "685646226942984206") return;
    else {
        superagent
            .get(`https://cataas.com/cat`)
            .end((err, res) => {
                if ((Math.floor(Math.random() * Math.floor(5)) === 3)) {
                    message.channel.send({ files: [`./breakbotIMG/${(Math.floor(Math.random() * Math.floor(4)))}.jpg`] })
                } else {
                    message.channel.send({ files: [res.body] });
                }
            });

    }
    client.logger.log('info', `breakbot command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
}