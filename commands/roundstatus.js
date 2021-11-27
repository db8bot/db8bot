const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roundstatus')
        .setDescription('Displays running debates in the server'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        if (!interaction.guild) return (interaction.reply('Command not available in DMs.'))
        const config = interaction.client.config
        const uri = `mongodb+srv://${config.MONGOUSER}:${config.MONGOPASS}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const guild = interaction.guild

        database.connect(async (err, dbClient) => {
            if (err) console.error(err)
            const collection = dbClient.db('db8bot').collection('debateTracking')
            var collectionFind = await collection.find({ guildId: guild.id }).toArray()
            const roundstats = new Discord.MessageEmbed()
                .setTitle(`Current Debates in ${guild.name}`)
                .setColor('#007fff')
            if (collectionFind[0] !== undefined) {
                for (var i = 0; i < collectionFind.length; i++) {
                    var aff = collectionFind[i].aff.map(user => `<@!${user.id}>`)
                    var neg = collectionFind[i].neg.map(user => `<@!${user.id}>`)
                    roundstats.addField(`Debate ${i + 1}`, `Name: ${collectionFind[i].name} | Event: ${collectionFind[i].event} | Judge: <@!${collectionFind[i].judge.id}> | Aff: ${aff.join(' ')} | Neg: ${neg.join(' ')} | Current Speech: ${collectionFind[i].speech === '' ? 'No speech started yet' : collectionFind[i].speech}`)
                }
            }
            interaction.reply({ embeds: [roundstats] })
        })
    }
}
