const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startround')
        .setDescription('Start a Debate Round.')
        .addUserOption(option =>
            option.setName('debater1')
                .setDescription('Mention Debater 1. Order of mentions is from Aff to Neg')
            // .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('debater2')
                .setDescription('Mention Debater 2. Order of mentions is from Aff to Neg')
            // .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('debater3')
                .setDescription('Mention Debater 3. Order of mentions is from Aff to Neg. Optional')
            // .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('debater4')
                .setDescription('Mention Debater 3. Order of mentions is from Aff to Neg. Optional')
            // .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('judge')
                .setDescription('Mention the Judge. Only 1 Judge supported.')
            // .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('event')
                .setDescription('Enter your event. cx/policy/pol, ld/douglas, pf/pufo/forum')
            // .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Round Name - Spaces Supported')
            // .setRequired(true)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        if (!interaction.guild) return (interaction.reply('Command not available in DMs.'))
        const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const guild = interaction.guild
        if (interaction.options.getString('name') === null) {
            interaction.reply('Missing fields! Check all fields are filled!')
            return
        }
        database.connect(async (err, dbClient) => {
            if (err) console.error(err)
            const collection = dbClient.db('db8bot').collection('debateTracking')
            var collectionFind = await collection.find({ debateId: interaction.guildId + interaction.options.getString('name', true) }).toArray()
            if (collectionFind[0] !== undefined) {
                interaction.reply('Choose a different name! Round name already exists.')
            } else {
                // hello to anyone reading this :) - Julian V.
                try { // fixes arg requirement while also satisfying discord's "Required options must be placed before non-required options"
                    var calculatedAff
                    var calculatedNeg
                    var debateConfig = {
                        guildId: interaction.guildId,
                        debateId: interaction.guildId + interaction.options.getString('name', true),
                        debater1: interaction.options.getUser('debater1', true),
                        debater2: interaction.options.getUser('debater2', true),
                        debater3: interaction.options.getUser('debater3', false),
                        debater4: interaction.options.getUser('debater4', false),
                        judge: interaction.options.getUser('judge', true),
                        event: interaction.options.getString('event', true).trim(),
                        name: interaction.options.getString('name', true).trim(),
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
                    collection.insertOne(debateConfig, function (err, res) {
                        if (err) console.error(err)
                    })

                    // send start round notification
                    const roundstartNotification = new Discord.MessageEmbed()
                        .setColor('#007fff')
                        .setTitle(`Round Started: ${debateConfig.name}`)
                        .addField('Round Name', debateConfig.name)
                        .addField('Event', debateConfig.event)
                        .addField('Judge', `<@!${debateConfig.judge.id}>`)
                        .addField('Aff', Array.from(debateConfig.aff).map(x => `<@!${x.id}>`).join(' '))
                        .addField('Neg', Array.from(debateConfig.neg).map(x => `<@!${x.id}>`).join(' '))
                    interaction.reply({ embeds: [roundstartNotification] })

                    // add roles

                    try {
                        for (var user of debateConfig.aff) {
                            guild.members.fetch(user.id).then(member => {
                                member.roles.add(guild.roles.cache.find(role => role.name === 'Currently Debating')).catch(err => console.error(err))
                            })
                        }
                        for (var user of debateConfig.neg) {
                            guild.members.fetch(user.id).then(member => {
                                member.roles.add(guild.roles.cache.find(role => role.name === 'Currently Debating')).catch(err => console.error(err))
                            })
                        }
                        guild.members.fetch(debateConfig.judge.id).then(member => {
                            member.roles.add(guild.roles.cache.find(role => role.name === 'Currently Judging')).catch(err => console.error(err))
                        })
                    } catch (e) {
                        console.error(e)
                        interaction.channel.send('Error! Please check that the "Currently Debating" & "Currently Judging" roles have been created.')
                    }
                } catch (err) {
                    console.error(err)
                    const help = new Discord.MessageEmbed()
                        .setColor('#f0ffff')
                        .setDescription('**Command: **' + '/startround')
                        .addField('**Usage:**', '/startround **<**Mentioned debaters in the order of AFF to NEG. At least 2 debaters required.**>** **<**Mentioned judge: Only supports 1 judge**>** **<**Type of event: policy/cx/pol, ld/douglas, pf/pufo/forum**>** **<**Round name: No spaces allowed in the name!**>**')
                        .addField('**Example:**', '/startround @AirFusion @Bob @Nick @David @JudgeMary policy AF-v-ND')
                        .addField('**Expected Result From Example:**', 'Bot returns round started message with round information.')
                        .addField('**NOTES**', 'The bot also supports currently debating and currently judging roles to be added to debaters and judges. Create two roles "Currently Debating" and "Currently Judging" to use this function. Make sure these two roles are below the bot\'s role.')
                    interaction.reply({ embeds: [help] })
                }
            }
        })
    }
}
