const { SlashCommandBuilder } = require('discord.js')
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
        require('../modules/telemetry').telemetry(__filename, interaction)
        const args = interaction.options.getString('message')

        interaction.client.options.disableMentions = 'all'
        if (interaction.user.id !== process.env.OWNER) {
            interaction.reply(filter.clean(args) + `\n-${interaction.user.tag}`)
        } else if (interaction.user.id === process.env.OWNER) {
            interaction.client.options.disableMentions = 'none'
            interaction.reply(args)
        }
    }
}
