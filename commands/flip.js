const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Flip a Coin - Useful for PF'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
         let coin = [
            'tails',
            'heads',
        ]
        let index = (Math.floor(Math.random() * Math.floor(coin.length)))
        const embed = new Discord.MessageEmbed()
        .setColor('00FFFF')
        .setTitle(coin[index] )
        interaction.reply({ embeds: [embed] })
    
    }
}
