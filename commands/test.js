const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('testcmd'),
    async execute(interaction) {
        console.log(interaction.guild)
    }
}
