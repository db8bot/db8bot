const { SlashCommandBuilder } = require('discord.js')
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
        require('../modules/telemetry').telemetry(__filename, interaction)
        interaction.reply({ content: 'Feedback received from Discord Chatbox! Thank you for your feedback!', ephemeral: true })
        // owner will always be in cache due to repeated checking of bot activity so this is ok
        interaction.client.users.cache.find(val1 => val1.id === process.env.OWNER).send(`New feedback from ${interaction.user.tag} from server: ${interaction.guild.name}. Message/Feedback: ${interaction.options.getString('feedback')}`)
    }
}
