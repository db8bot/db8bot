const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios').default
const qs = require('qs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getpress')
        .setDescription('Get an article from the press such as NYT. **This feature is in beta & may not work 100%.**')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('link to article')
                .setRequired(true)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        var url = interaction.options.getString('link')
        var data
        if (interaction.inGuild()) {
            data = qs.stringify({
                'link': url,
                'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4538.0 Safari/537.36',
                'guildid': interaction.guildid, // take care of reqs in dms - same on server side
                'requser': interaction.user.id,
                'channelid': interaction.channelId
            })
        } else {
            data = qs.stringify({
                'link': url,
                'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4538.0 Safari/537.36',
                'guildid': null, // take care of reqs in dms - same on server side
                'requser': interaction.user.id,
                'channelid': null
            })
        }
        var config = {
            method: 'post',
            url: 'http://34.122.88.90:8081/add',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        }

        axios(config)
            .then(function (response) {
                interaction.reply('Job added to queue. Please look for a message in the same channel soon. If the message does not appear, try again in a few minutes.')
            })
            .catch(function (error) {
                console.log(error)
            })
    }
}
