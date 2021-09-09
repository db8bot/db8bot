const { SlashCommandBuilder } = require('@discordjs/builders')
const superagent = require('superagent')
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('judgeinfo')
        .setDescription('Look up a judge\'s paradigm on Tabroom.com')
        .addStringOption(option =>
            option.setName('judge')
                .setDescription('first & last name of judge on Tabroom.com')
                .setRequired(true)
        ),
    async execute(interaction) {
        interaction.client.logger.log('info', `judgeinfo command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const config = interaction.client.config
        const args = interaction.options.getString('judge').split(' ')
        superagent
            .post('https://debateapis.wm.r.appspot.com/paradigm')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(JSON.parse(`{"apiauth": "${config.tabAPIKey}", "type":"name", "first":"${args[0]}", "last":"${args[1]}", "short":"${true}"}`))
            .end((err, res) => {
                if (err) console.error(err)
                if (res.statusCode === 204) {
                    interaction.reply('No judges found or the specified judge does not have a paradigm.')
                    return
                }
                if (typeof res.body[0] !== 'string') { // multiple paradigms under the same name
                    interaction.reply(`Found ${res.body.length} paradigms/tabroom accounts under ${args[0]} ${args[1]}. Sending all of them, each direct link marks the end of a paradigm.`)
                    for (var x = 0; x < res.body.length; x++) {
                        var paradigm = res.body[x][0]
                        if (paradigm.length > 1990) {
                            while (paradigm.length > 1990) {
                                interaction.channel.send('```' + paradigm.substring(0, 1990).trim() + '```')
                                paradigm = paradigm.replace(paradigm.substring(0, 1990).trim(), '')
                            }
                            interaction.channel.send('```' + paradigm + '```')
                        } else {
                            interaction.channel.send('```' + paradigm + '```')
                        }
                        interaction.channel.send(`Direct Link: ${res.body[x][2]}`)
                    }
                } else {
                    var paradigm = res.body[0]
                    var firstTime = true
                    if (paradigm.length > 1990) {
                        while (paradigm.length > 1990) {
                            if (firstTime) {
                                interaction.reply('```' + paradigm.substring(0, 1990).trim() + '```')
                                firstTime = false
                            } else {
                                interaction.channel.send('```' + paradigm.substring(0, 1990).trim() + '```')
                                paradigm = paradigm.replace(paradigm.substring(0, 1990).trim(), '')
                            }
                        }
                        interaction.channel.send('```' + paradigm + '```')
                    } else {
                        interaction.channel.send('```' + paradigm + '```')
                    }
                    interaction.channel.send(`Direct Link: https://www.tabroom.com/index/paradigm.mhtml?search_first=${args[0]}&search_last=${args[1]}`)
                }
            })
    }
}
