exports.run = function (client, message, args) {
    const superagent = require('superagent');
    const Discord = require('discord.js');
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
    }
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } if (getRandomIntInclusive(0, 1) === 1) {
        superagent
            .get(`https://api.whatdoestrumpthink.com/api/v1/quotes/random`)
            .end((err, res) => {
                const quoteSend = new Discord.MessageEmbed()
                    .setColor("#b8860b")
                    .setTitle(`Quote by Donald Trump`)
                    .setDescription(`"${res.body.message}"\n-Donald Trump`)
                    .setFooter(`Disclaimer: This command is purely for satirical purposes. It does not represent the creator, the owner, or the user's views.`)
                message.channel.send({ embeds: [quoteSend] })
            })
    } else {
        superagent
            .get(`https://tronalddump.io/random/quote`)
            .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
            .end((err, res) => {
                if (err) throw new Error(err);
                const quoteSend = new Discord.MessageEmbed()
                    .setColor("#b8860b")
                    .setTitle(`Quote by Donald Trump`)
                    .setDescription(`"${res.body.value}"\n-Donald Trump`)
                    .addField(`Source`, `[Here](${res.body._embedded.source[0].url})`)
                    .setFooter(`Disclaimer: This command is purely for satirical purposes. It does not represent the creator, the owner, or the user's views.`)
                message.channel.send({ embeds: [quoteSend] })
            })
    }
    client.logger.log('info', `trump command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
}