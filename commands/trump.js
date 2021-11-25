const { SlashCommandBuilder } = require('@discordjs/builders')
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
const superagent = require('superagent')
const Discord = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('trump')
        .setDescription('Quote by Donald Trump'),
    async execute(interaction) {
        require('../telemetry').telemetry(__filename, interaction)
        if (getRandomIntInclusive(0, 1) === 1) {
            superagent
                .get('https://api.whatdoestrumpthink.com/api/v1/quotes/random')
                .end((err, res) => {
                    if (err) console.error(err)
                    const quoteSend = new Discord.MessageEmbed()
                        .setColor('#b8860b')
                        .setTitle('Quote by Donald Trump')
                        .setDescription(`"${res.body.message}"\n-Donald Trump`)
                        .setFooter('Disclaimer: This command is purely for satirical purposes. It does not represent the creator, the owner, or the user\'s views.')
                    interaction.reply({ embeds: [quoteSend] })
                })
        } else {
            superagent
                .get('https://tronalddump.io/random/quote')
                .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
                .end((err, res) => {
                    if (err) console.err(err)
                    const quoteSend = new Discord.MessageEmbed()
                        .setColor('#b8860b')
                        .setTitle('Quote by Donald Trump')
                        .setDescription(`"${res.body.value}"\n-Donald Trump`)
                        .addField('Source', `[Here](${res.body._embedded.source[0].url})`)
                        .setFooter('Disclaimer: This command is purely for satirical purposes. It does not represent the creator, the owner, or the user\'s views.')
                    interaction.reply({ embeds: [quoteSend] })
                })
        }
    }
}
