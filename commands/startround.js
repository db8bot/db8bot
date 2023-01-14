const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const MongoClient = require('mongodb').MongoClient

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startround')
        .setDescription('Start a Debate Round.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Round Name - Spaces Supported')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('event')
                .setDescription('Enter your event. cx/policy/pol, ld/douglas, pf/pufo/forum')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('judge')
                .setDescription('Mention the Judge. Only 1 Judge supported.')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('debater1')
                .setDescription('Mention Debater 1. Order of mentions is from Aff to Neg')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('debater2')
                .setDescription('Mention Debater 2. Order of mentions is from Aff to Neg')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('debater3')
                .setDescription('Mention Debater 3. Order of mentions is from Aff to Neg. Optional')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('debater4')
                .setDescription('Mention Debater 3. Order of mentions is from Aff to Neg. Optional')
                .setRequired(false)
        )
        .setDMPermission(false),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        // ensure interaction is in server only
        if (!interaction.inGuild()) return interaction.reply('This command must be executed from a server!')

        const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@db8botcluster.q3bif.mongodb.net/db8bot?retryWrites=true&w=majority`

        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

        const guild = interaction.guild

        var dbClient = await database.connect()

        const collection = dbClient.db('db8bot').collection('debateTracking')
        var collectionFind = await collection.find({ debateId: interaction.guildId + interaction.options.getString('name', true) }).toArray()
        if (collectionFind[0] !== undefined) {
            interaction.reply('Choose a different name! There is already a round with the same name in this guild.')
        } else {
            // hello to anyone reading this :) - Julian V.
            var calculatedAff
            var calculatedNeg
            var debateConfig = {
                guildId: interaction.guildId,
                debateId: interaction.guildId + interaction.options.getString('name'),
                debater1: interaction.options.getUser('debater1'),
                debater2: interaction.options.getUser('debater2'),
                debater3: interaction.options.getUser('debater3'),
                debater4: interaction.options.getUser('debater4'),
                judge: interaction.options.getUser('judge'),
                event: interaction.options.getString('event').trim(),
                name: interaction.options.getString('name').trim(),
                speech: '',
                decision: ''
            }
            if (!debateConfig.debater3 || !debateConfig.debater4) { // ld
                calculatedAff = [debateConfig.debater1]
                calculatedNeg = [debateConfig.debater2]
            } else { // pf/cx - 2 ppl/side events
                calculatedAff = [debateConfig.debater1, debateConfig.debater2]
                calculatedNeg = [debateConfig.debater3, debateConfig.debater4]
            }
            debateConfig.aff = calculatedAff
            debateConfig.neg = calculatedNeg

            // write config to mongo
            await collection.insertOne(debateConfig)

            // send start round notification
            const roundstartNotification = new EmbedBuilder()
                .setColor('#007fff')
                .setTitle(`Round Started: ${debateConfig.name}`)
                .addFields(
                    {
                        name: 'Round Name',
                        value: debateConfig.name
                    },
                    {
                        name: 'Event',
                        value: debateConfig.event
                    },
                    {
                        name: 'Judge',
                        value: `<@!${debateConfig.judge.id}>`
                    },
                    {
                        name: 'Affirmative',
                        value: Array.from(debateConfig.aff).map(x => `<@!${x.id}>`).join(' ')

                    },
                    {
                        name: 'Negative',
                        value: Array.from(debateConfig.neg).map(x => `<@!${x.id}>`).join(' ')
                    }
                )
                .setTimestamp()

            // add roles
            const currentDebatingRole = guild.roles.cache.find(role => role.name === 'Currently Debating')
            const currentJudgingRole = guild.roles.cache.find(role => role.name === 'Currently Judging')
            if (!currentDebatingRole || !currentJudgingRole) {
                interaction.reply({ content: 'Round created successfully without assigning "Now Debating" & "Now Judging" roles. Please check that the "Currently Debating" & "Currently Judging" roles have been created and that its position in the role list is below the role of db8bot.', ephemeral: true })

                interaction.channel.send({ embeds: [roundstartNotification] })
            } else {
                interaction.reply({ embeds: [roundstartNotification] })
                for (const user of debateConfig.aff) {
                    guild.members.fetch(user.id).then(member => {
                        member.roles.add(guild.roles.cache.find(role => role.name === 'Currently Debating')).catch(err => console.error(err))
                    })
                }
                for (const user of debateConfig.neg) {
                    guild.members.fetch(user.id).then(member => {
                        member.roles.add(guild.roles.cache.find(role => role.name === 'Currently Debating')).catch(err => console.error(err))
                    })
                }
                guild.members.fetch(debateConfig.judge.id).then(member => {
                    member.roles.add(guild.roles.cache.find(role => role.name === 'Currently Judging')).catch(err => console.error(err))
                })
            }
        }
        dbClient.close()
    }
}
