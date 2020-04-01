exports.run = function (client, message, args) {
    const superagent = require('superagent');
    const Discord = require('discord.js');
    superagent
    .get(`https://api.whatdoestrumpthink.com/api/v1/quotes/random`)
    .end((err,res) => {
        const quoteSend = new Discord.MessageEmbed()
            .setColor("#b8860b")
            .setTitle(`Quote by Donald Trump`)
            .setDescription(`"${res.body.message}"\n-Donald Trump`)
            .setFooter(`Disclaimer: This command is purely for satirical purposes. It does not represent the creator, the owner, or the user's views.`)
        message.channel.send({ embed: quoteSend })
    })
    client.logger.log('info', `trump command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
}