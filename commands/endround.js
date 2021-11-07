const { SlashCommandBuilder } = require('@discordjs/builders')
const MongoClient = require('mongodb').MongoClient
const Discord = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('endround')
        .setDescription('end a debate round')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('the name of the debate round')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('decision')
                .setDescription('decision of the round')
                .addChoices([['aff/pro', 'aff/pro'], ['neg/con', 'neg/con']])
                .setRequired(true)
        ),
    async execute(interaction) {
        interaction.client.logger.log('info', `endround command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const config = interaction.client.config
        const uri = `mongodb+srv://${config.MONGOUSER}:${config.MONGOPASS}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        database.connect(async (err, dbClient) => {
            if (err) console.error(err)
            const collection = dbClient.db('db8bot').collection('debateTracking')
            const archiveCollection = dbClient.db('db8bot').collection('debateTrackingArchive')

            var collectionFind = await collection.find({ debateId: interaction.guildId + interaction.options.getString('name') }).toArray()

            if (collectionFind[0] === undefined) interaction.reply('Round not found!')
            else {
                const results = new Discord.MessageEmbed()
                    .setTitle(`Round Ended - ${interaction.guild.name} ${collectionFind[0].name} Results`)
                    .setColor('#007fff')
                    .addField('Event', collectionFind[0].event)
                    .addField('Judge', `<@!${collectionFind[0].judge.id}>`)
                    .addField('Aff', collectionFind[0].aff.map(user => `<@!${user.id}>`).join(' '))
                    .addField('Neg', collectionFind[0].neg.map(user => `<@!${user.id}>`).join(' '))
                    .addField('Decision', interaction.options.getString('decision'))
                    .setFooter(config.NAME)
                    .setTimestamp()
                interaction.reply({ embeds: [results] })
                collectionFind[0].decision = interaction.options.getString('decision')
                archiveCollection.insertOne(collectionFind[0], function (err, res) {
                    if (err) console.error(err)
                    console.log('1 document inserted')
                })
                collection.deleteOne({ debateId: interaction.guildId + interaction.options.getString('name') }, function (err, obj) {
                    if (err) console.log(err)
                    console.log('deleted')
                })
            }
        })
    }
}
