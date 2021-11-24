const { SlashCommandBuilder } = require('@discordjs/builders')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Submit Feedback to the db8bot Creator')
        .addStringOption(option =>
            option.setName('feedback')
                .setDescription('Your Description')
                .setRequired(true)
        ),
    async execute(interaction) {
        require('../telemetry').telemetry(__filename, interaction)
        const config = interaction.client.config
        interaction.reply({ content: 'Feedback received from Discord Chatbox! Thank you for your feedback!', ephemeral: true })
        interaction.client.users.cache.find(val1 => val1.id === config.OWNER).send(`New feedback from ${interaction.user.tag} from server: ${interaction.guild.name}. Message/Feedback: ${interaction.options.getString('feedback')}`)
    }
}
