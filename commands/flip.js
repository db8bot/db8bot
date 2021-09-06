const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Flip a Coin - Useful for PF'),
    async execute(interaction) {
        interaction.client.logger.log('info', `flip command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        interaction.reply((Math.floor(Math.random() * 2) === 0) ? 'heads' : 'tails')
    }
}
