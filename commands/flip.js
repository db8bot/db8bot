const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Flip a Coin - Useful for PF'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        interaction.reply((Math.floor(Math.random() * 2) === 0) ? 'heads' : 'tails')
    }
}
