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
        interaction.client.logger.log('info', `startround command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const config = interaction.client.config
        const uri = `mongodb+srv://${config.mongoUser}:${config.mongoPass}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`
        const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        database.connect(async (err, dbClient) => {
            if (err) console.error(err)
            try { // fixes arg requirement while also satisfying discord's "Required options must be placed before non-required options"
                var debateConfig = {
                    debater1: interaction.options.getUser('debater1', true),
                    debater2: interaction.options.getUser('debater2', true),
                    debater3: interaction.options.getUser('debater3', false),
                    debater4: interaction.options.getUser('debater4', false),
                    judge: interaction.options.getUser('judge', true),
                    event: interaction.options.getString('event', true),
                    name: interaction.options.getString('name', true)
                }
            } catch (err) {
                const help = new Discord.MessageEmbed()
                    .setColor('#f0ffff')
                    .setDescription('**Command: **' + '/startround')
                    .addField('**Usage:**', '/startround **<**Mentioned debaters in the order of AFF to NEG. At least 2 debaters required.**>** **<**Mentioned judge: Only supports 1 judge**>** **<**Type of event: policy/cx/pol, ld/douglas, pf/pufo/forum**>** **<**Round name: No spaces allowed in the name!**>**')
                    .addField('**Example:**', '/startround @AirFusion @Bob @Nick @David @JudgeMary policy AF-v-ND')
                    .addField('**Expected Result From Example:**', 'Bot returns round started message with round information.')
                    .addField('**NOTES**', 'The bot also supports currently debating and currently judging roles to be added to debaters and judges. Create two roles "Currently Debating" and "Currently Judging" to use this function. Make sure these two roles are below the bot\'s role.')
                interaction.reply({ embeds: [help] })
            }
        })
    }
}
