const { SlashCommandBuilder } = require('@discordjs/builders')
const quotes = require('../quoteFiles/foucaultQuote.json')
const translate = require('@vitalets/google-translate-api')
const Discord = require('discord.js')
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('foucault')
        .setDescription('Quote by Michel Foucault'),
    async execute(interaction) {
        require('../telemetry').telemetry(__filename, interaction)
        const num = getRandomIntInclusive(1, quotes.length)
        translate(quotes[num].quote, { to: 'en' }).then(res => {
            const quoteSend = new Discord.MessageEmbed()
                .setColor('#f5f5f5')
                .setTitle(`Quote by ${quotes[num].author}`)
                .setDescription(`"${res.text}"\n-${quotes[num].author}`)
                .setFooter('Disclaimer: This command is purely for satirical purposes. It does not represent the creator, the owner, or the user\'s views.')
            interaction.reply({ embeds: [quoteSend] })
        }).catch(err => {
            console.error(err)
        })
    }
}
