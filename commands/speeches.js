const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('speeches')
        .setDescription('Shows available speeches for debate function'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        var allowedSpeeches = ['1AC', 'CX1', '1NC', 'CX2', '2AC', 'CX3', '2NC', 'CX4', '1NR', '1AR', '2NR', '2AR']
        var ldSpeeches = ['AC', 'CX1', 'NC', 'CX2', '1AR', 'NR', '2AR']
        var pfSpeeches = ['Constructive A', 'Constructive B', 'Crossfire 1', 'Rebuttle A', 'Rebuttle B', 'Crossfire 2', 'Summary A', 'Summary B', 'Grand crossfire', 'Final Focus A', 'Final Focus B']
        interaction.reply(`**Policy Speeches:** ${allowedSpeeches.join(', ')}\n**LD Speeches:** ${ldSpeeches.join(', ')}\n**PF Speeches:** ${pfSpeeches.join(', ')}`)
    }
}
