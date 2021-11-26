const Discord = require('discord.js')

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function sendQuote(quotes, message, color) {
    const num = getRandomIntInclusive(1, quotes.length)

    const quoteSend = new Discord.MessageEmbed()
        .setColor(color)
        .setDescription(`"${quotes[num].quote}"\n-${quotes[num].author}`)
        .setFooter('Disclaimer: This command is purely for entertainment purposes. It does not attempt to represent the creator, the owner, or the user\'s views. Quotes sourced from Goodreads, Quotes.net, Brainy Quotes & may contain inaccuracies.')
    if (quotes[num].translated) {
        quoteSend.setTitle(`Quote by ${quotes[num].author} - Translated by Google Translate`)
        quoteSend.addField('Original Quote:', quotes[num].original)
    } else {
        quoteSend.setTitle(`Quote by ${quotes[num].author}`)
    }
    message.channel.send({ embeds: [quoteSend] })
}

module.exports = {
    sendQuote: sendQuote
}
