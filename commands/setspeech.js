const { SlashCommandBuilder } = require('@discordjs/builders')
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
                .setDescription('speech to set the debate round to - for list of officially supported speeches, use /speeches')
                .setRequired(true)
        ),
    async execute(interaction) {
        require('../telemetry').telemetry(__filename, interaction)
        const config = interaction.client.config
        const uri = `mongodb+srv://${config.MONGOUSER}:${config.MONGOPASS}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        database.connect(async (err, dbClient) => {
            if (err) console.error(err)
            const collection = dbClient.db('db8bot').collection('debateTracking')

            var collectionFind = await collection.find({ debateId: interaction.guildId + interaction.options.getString('name') }).toArray()

            if (collectionFind[0] === undefined) interaction.reply('Round not found!')
            else {
                var allowedSpeeches = [
                    '1ac', 'cx1',
                    '1nc', 'cx2',
                    '2ac', 'cx3',
                    '2nc', 'cx4',
                    '1nr', '1ar',
                    '2nr', '2ar',
                    'ac', 'cx1',
                    'nc', 'cx2',
                    '1ar', 'nr',
                    '2ar', 'constructive a',
                    'constructive b', 'crossfire 1',
                    'rebuttle a', 'rebuttle b',
                    'crossfire 2', 'summary a',
                    'summary b', 'grand crossfire',
                    'final focus a', 'final focus b'
                ]

                const updateDocument = {
                    $set: {
                        speech: interaction.options.getString('speech')
                    }
                }
                await collection.updateOne({ debateId: interaction.guildId + interaction.options.getString('name') }, updateDocument)
                if (allowedSpeeches.includes(interaction.options.getString('speech').toLowerCase().replace(' ', ''))) {
                    interaction.reply(`Supported Speech! :white_check_mark: Speech successfully set to ${interaction.options.getString('speech')}`)
                } else {
                    interaction.reply(`:warning: Unsupported Speech! :white_check_mark: Speech successfully set to ${interaction.options.getString('speech')}`)
                }
            }
        })
    }
}
