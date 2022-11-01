const Discord = require('discord.js')

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function sendQuote(quotes, interaction, color) {
    const num = getRandomIntInclusive(1, quotes.length)

    const quoteSend = new Discord.EmbedBuilder()
        .setColor(color)
        .setDescription(`"${quotes[num].quote}"\n-${quotes[num].author}`)
        .setFooter({ text: 'Disclaimer: This command is purely for entertainment purposes. It does not attempt to represent the creator, the owner, or the user\'s views. Quotes sourced from Goodreads, Quotes.net, Brainy Quotes & may contain inaccuracies.' })
    if (quotes[num].translated) {
        quoteSend.setTitle(`Quote by ${quotes[num].author} - Translated by Google Translate`)
        quoteSend.addFields({ name: 'Original Quote:', value: quotes[num].original })
    } else {
        quoteSend.setTitle(`Quote by ${quotes[num].author}`)
    }
    interaction.reply({ embeds: [quoteSend] })
}

module.exports = {
    sendQuote: sendQuote
}
