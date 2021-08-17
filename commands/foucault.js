function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

exports.run = function (client, message) {
    const quotes = require("../quoteFiles/foucaultQuote.json");
    const Discord = require('discord.js');
    const fs = require("fs")
    const translate = require('@vitalets/google-translate-api');
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } let num = getRandomIntInclusive(1, quotes.length)
    if (num === quotes[quotes.length - 1].lastNumber) num = getRandomIntInclusive(1, quotes.length - 1)
    if (quotes[num] === quotes[quotes.length - 1].lastQuote) num = getRandomIntInclusive(1, quotes.length - 1)
    // console.log(num)
    translate(quotes[num].quote, { to: 'en' }).then(res => {
        const quoteSend = new Discord.MessageEmbed()
            .setColor("#f5f5f5")
            .setTitle(`Quote by ${quotes[num].author}`)
            .setDescription(`"${res.text}"\n-${quotes[num].author}`)
            .setFooter(`Disclaimer: This command is purely for satirical purposes. It does not represent the creator, the owner, or the user's views.`)
        message.channel.send({ embeds: [quoteSend] })
    }).catch(err => {
        console.log(err)
    })
    client.logger.log('info', `foucault command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
    quotes[quotes.length - 1].lastQuote = quotes[num].quote
    quotes[quotes.length - 1].lastNumber = num
    // fs.writeFile('./quoteFiles/foucaultQuote.json', JSON.stringify(quotes, null, 2), function (err) {
    //     if (err) return console.error(err);
    // });
}