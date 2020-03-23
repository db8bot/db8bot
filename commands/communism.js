function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

exports.run = function (client, message) {
    const quotes = require("../quotes.json");
    const Discord = require('discord.js');
    const fs = require("fs")

    let num = getRandomIntInclusive(1, quotes.length)
    if (num===quotes[quotes.length-1].lastNumber) num = getRandomIntInclusive(1, quotes.length-1)
    if (quotes[num]===quotes[quotes.length-1].lastQuote) num = getRandomIntInclusive(1, quotes.length-1)
    const quoteSend = new Discord.MessageEmbed()
        .setColor("#dd0200")
        .setTitle(`Quote by ${quotes[num].author}`)
        .setDescription(`"${quotes[num].quote}"\n-${quotes[num].author}`)
        .setFooter(`Disclaimer: This command is purely for satirical purposes. It does not represent the creator, the owner, or the user's views.`)
    message.channel.send({ embed: quoteSend })

    quotes[quotes.length-1].lastQuote = quotes[num].quote
    quotes[quotes.length-1].lastNumber = num
    fs.writeFile('../quotes.json', JSON.stringify(quotes, null, 2), function (err) {
        if (err) return console.error(err);
        // message.channel.send(`Prefix Successfully Changed to ${config.prefix}.`)
    });
}