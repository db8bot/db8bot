
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('benmoshe')
        .setDescription('wHy r u rEaDINg bEn mOSHe'),
    async execute(interaction) {
        interaction.reply({ content: 'wHy r u rEaDINg bEn mOSHe', files: ['./assets/benmoshe.png'] })
    }
}
