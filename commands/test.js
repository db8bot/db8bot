const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('testcmd'),
    async execute(interaction) {
        const config = interaction.client.config
        console.log(`mongodb+srv://${config.mongoUser}:${config.mongoPass}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`)
    }
}
