const { SlashCommandBuilder } = require('discord.js')
const { v4: uuidv4 } = require('uuid')
const superagent = require('superagent')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get')
        .setDescription('search for an accessible version of a journal article. For books use getbook.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Input a DOI or title to search.')
                .setRequired(true)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)

        // assemble the request - following standard blaze request structure

        const source = interaction.options.getString('query')
        var jobID = uuidv4()

        await interaction.reply(`Journal request has been added to the queue. You should see a message in this channel with the result shortly. Job ID: \`${jobID}\``)

        superagent
            .post(`${process.env.BLAZEURL}/get`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                auth: process.env.BLAZEAUTH,
                serverID: (interaction.inGuild()) ? interaction.guildId : null,
                channelID: interaction.channelId,
                memberID: (interaction.member) ? interaction.member.id : null,
                dmUser: interaction.user.id,
                time: Date.now(),
                tag: interaction.user.tag,
                jobID,
                source
            })
            .end((err, res) => {
                if (err) console.error(err)
            })
    }
}
