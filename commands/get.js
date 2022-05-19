const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios').default
const qs = require('qs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get')
        .setDescription('unlock research paywalls')
        .addStringOption(option =>
            option.setName('source')
                .setDescription('link with doi, doi number OR title of research')
                .setRequired(true)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        // get search from input
        const input = interaction.options.getString('source')

        // regex match doi or the title of paper
        var search = input.match(/\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&'<>])\S)+)\b/gm)
        if (search === null) search = input
        else search = search[0]

        // request to scihub.se with search term - either doi or link or title of paper - it will automatically resolve to a scihub link
        try {
            axios.post('https://db8bot.uc.r.appspot.com/get/paper', qs.stringify({
                query: search
            }), {
                'Content-Type': 'application/x-www-form-urlencoded'
            }).then((res) => {
                if (res.data.includes('sci-hub')) {
                    interaction.reply(res.data)
                    interaction.channel.send({
                        files: [res.data + '.pdf']
                    })
                } else {
                    interaction.reply('Not Found. If the article has a DOI, you should try using that. You should also try setting the paper\'s title as the source. If you are searching a book, use /getbook, if you are trying to get a news article from the press, use /getmedia.')
                }
            })
        } catch (e) {
            console.error(e)
            interaction.reply('Not Found. If the article has a DOI, you should try using that. You should also try setting the paper\'s title as the source. If you are searching a book, use /getbook, if you are trying to get a news article from the press, use /getmedia.')
        }
    }
}
