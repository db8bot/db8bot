const { SlashCommandBuilder } = require('discord.js')
const MongoClient = require('mongodb').MongoClient

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setspeech')
        .setDescription('Set current speech for a debate round')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('the name of the debate round')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('speech')
                .setDescription('speech to set the debate round to')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        const choices = ['1AC', 'Cross-Examination 1',
            '1NC', 'Cross-Examination 2',
            '2AC', 'Cross-Examination 3',
            '2NC', 'Cross-Examination 4',
            '1NR', '1AR',
            '2NR', '2AR',
            'AC', 'NC',
            '1AR', 'NR',
            '2AR', 'Constructive A',
            'Constructive B', 'Crossfire 1',
            'Rebuttle A', 'Rebuttle B',
            'Crossfire 2', 'Summary A',
            'Summary B', 'Grand Crossfire',
            'Final Focus A', 'Final Focus B']
        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()))
        var options
        if (filtered.length > 25) {
            options = filtered.slice(0, 25)
        } else {
            options = filtered
        }
        await interaction.respond(
            options.map(choice => ({ name: choice, value: choice }))
        )
    },
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        // ensure interaction is in server only
        if (!interaction.inGuild()) return interaction.reply('This command must be executed from a server!')
        const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@db8botcluster.q3bif.mongodb.net/db8bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const dbClient = await database.connect()
        const collection = dbClient.db('db8bot').collection('debateTracking')

        var collectionFind = await collection.find({ debateId: interaction.guildId + interaction.options.getString('name') }).toArray()

        if (collectionFind[0] === undefined) interaction.reply('Round not found!')
        else {
            const updateDocument = {
                $set: {
                    speech: interaction.options.getString('speech')
                }
            }
            await collection.updateOne({ debateId: interaction.guildId + interaction.options.getString('name') }, updateDocument)
            interaction.reply(`:white_check_mark: Speech successfully set to ${interaction.options.getString('speech')}`)
        }
        database.close()
    }
}
