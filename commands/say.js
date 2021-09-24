const { SlashCommandBuilder } = require('@discordjs/builders')
const Filter = require('bad-words')
var filter = new Filter()
module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make db8bot say something')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message for db8bot to say')
                .setRequired(true)
        ),
    async execute(interaction) {
        interaction.client.logger.log('info', `say command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const config = interaction.client.config
        const args = interaction.options.getString('message')

        interaction.client.options.disableMentions = 'all'
        if (interaction.user.id !== config.owner) {
            interaction.reply(filter.clean(args) + `\n-${interaction.user.tag}`)
        } else if (interaction.user.id === config.owner) {
            interaction.client.options.disableMentions = 'none'
            interaction.reply(args)
        }
    }
}
