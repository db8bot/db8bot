const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('debatehelp')
        .setDescription('Show Help for Debate Commands'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const select = getRandomIntInclusive(1, 3)
        const embed = new EmbedBuilder()
            .setColor(select === 1 ? '#ccff00' : select === 2 ? '#0072bb' : select === 3 ? '#ff4f00' : '#ccff00')
            .setTitle('db8bot Debate Tracking Commands Help\n')
            .addFields(
                { name: 'Start a Round', value: 'Use the `/startround` command' },
                { name: 'Update a Round', value: 'Set the current speech using the `/setspeech` command.' },
                { name: 'Check Round Status', value: 'Use the `/roundstatus` command. Rounds are identified by the name assigned at the start of the round.' },
                { name: 'Flip a coin for Public Forum Debate', value: 'Use the `/flip` command' }
            )
        interaction.reply({ embeds: [embed] })
    }
}
