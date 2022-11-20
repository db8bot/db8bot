const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('endround')
        .setDescription('end a debate round')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('the name of the debate round')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('decision')
                .setDescription('decision of the round')
                .addChoices({ name: 'aff/pro', value: 'aff/pro' }, { name: 'neg/con', value: 'neg/con' })
                .setRequired(true)
        ),
    async autocomplete(interaction) {
        const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@db8botcluster.q3bif.mongodb.net/db8bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const dbClient = await database.connect()
        const collection = dbClient.db('db8bot').collection('debateTracking')
        const choices = (await collection.find({ guildId: interaction.guildId }).toArray()).map(round => round.name)
        const focusedValue = interaction.options.getFocused()
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
        dbClient.close()
    },
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        // ensure interaction is in server only
        if (!interaction.inGuild()) return interaction.reply('This command must be executed from a server!')
        const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@db8botcluster.q3bif.mongodb.net/db8bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const dbClient = await database.connect()
        const collection = dbClient.db('db8bot').collection('debateTracking')
        const archiveCollection = dbClient.db('db8bot').collection('debateTrackingArchive')

        var collectionFind = await collection.find({ debateId: interaction.guildId + interaction.options.getString('name') }).toArray()

        if (collectionFind[0] === undefined) interaction.reply('Round not found!')
        else {
            const results = new Discord.EmbedBuilder()
                .setTitle(`Round Ended - ${interaction.guild.name} ${collectionFind[0].name} Results`)
                .setColor('#007fff')
                .addFields(
                    { name: 'Event', value: collectionFind[0].event },
                    { name: 'Judge', value: `<@!${collectionFind[0].judge.id}>` },
                    { name: 'Aff', value: collectionFind[0].aff.map(user => `<@!${user.id}>`).join(' ') },
                    { name: 'Neg', value: collectionFind[0].neg.map(user => `<@!${user.id}>`).join(' ') },
                    { name: 'Decision', value: interaction.options.getString('decision') }
                )
                .setFooter({ text: process.env.NAME })
                .setTimestamp()
            interaction.reply({ embeds: [results] })
            collectionFind[0].decision = interaction.options.getString('decision')
            await archiveCollection.insertOne(collectionFind[0])
            await collection.deleteOne({ debateId: interaction.guildId + interaction.options.getString('name') })
        }
        dbClient.close()
    }
}
