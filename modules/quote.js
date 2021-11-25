const Discord = require('discord.js')

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function sendQuote(quotes, interaction) {
    const num = getRandomIntInclusive(1, quotes.length)

    const quoteSend = new Discord.MessageEmbed()
        .setColor('#ffff00')
        .setDescription(`"${quotes[num].quote}"\n-${quotes[num].author}`)
        .setFooter('Disclaimer: This command is purely for satirical purposes. It does not represent the creator, the owner, or the user\'s views. Quotes sourced from Goodreads & may contain inaccuracies.')
    if (quotes[num].translated) {
        quoteSend.setTitle(`Quote by ${quotes[num].author} - Translated by Google Translate`)
        quoteSend.addField('Original Quote:', quotes[num].original)
    } else {
        quoteSend.setTitle(`Quote by ${quotes[num].author}`)
    }
    interaction.reply({ embeds: [quoteSend] })
}

module.exports = {
    sendQuote: sendQuote
}
