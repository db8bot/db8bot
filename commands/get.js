const { SlashCommandBuilder } = require('@discordjs/builders')
const superagent = require('superagent')

async function reqSciHub(query) {
    return new Promise((resolve, reject) => {
        superagent
            .post('https://sci-hub.se/')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(JSON.parse(`{
        "request": "${query}"
    }`))
            .redirects(2)
            .end((err, res) => {
                if (err) console.error(err)
                // match pdf
                try {
                    resolve(res.text.match(/src="(.*?)" id = "pdf"/)[1].trim().replace('//', 'https://').replace('"', ''))
                } catch (err) {
                    // no scihub  - do other stuff.
                    reject(err)
                }
            })
    })
}

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
            var sciHubLink = await reqSciHub(search)
            interaction.reply(sciHubLink)
            interaction.channel.send({
                files: [sciHubLink + '.pdf']
            })
        } catch (e) {
            console.error(e)
            interaction.reply('Not Found. If the article has a DOI, you should try using that. You should also try setting the paper\'s title as the source. If you are searching a book, use /getbook, if you are trying to get a news article from the press, use /getmedia.')
        }
    }
}
