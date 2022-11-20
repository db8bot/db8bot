const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('roundstatus')
        .setDescription('Displays running debates in the server'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        // ensure interaction is in server only
        if (!interaction.inGuild()) return interaction.reply('This command must be executed from a server!')
        const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@db8botcluster.q3bif.mongodb.net/db8bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const guild = interaction.guild

        const dbClient = await database.connect()
        const collection = dbClient.db('db8bot').collection('debateTracking')
        var collectionFind = await collection.find({ guildId: guild.id }).toArray()
        const roundstats = new Discord.EmbedBuilder()
            .setTitle(`Current Debates in ${guild.name}`)
            .setColor('#007fff')
        var roundstatsFields = []
        if (collectionFind[0] !== undefined) {
            for (var i = 0; i < collectionFind.length; i++) {
                var aff = collectionFind[i].aff.map(user => `<@!${user.id}>`)
                var neg = collectionFind[i].neg.map(user => `<@!${user.id}>`)
                roundstatsFields.push({ name: `Debate ${i + 1}`, value: `Name: ${collectionFind[i].name} | Event: ${collectionFind[i].event} | Judge: <@!${collectionFind[i].judge.id}> | Aff: ${aff.join(' ')} | Neg: ${neg.join(' ')} | Current Speech: ${collectionFind[i].speech === '' ? 'No speech started yet' : collectionFind[i].speech}` })
            }
        }
        roundstats.addFields(roundstatsFields)
        interaction.reply({ embeds: [roundstats] })
        dbClient.close()
    }
}
