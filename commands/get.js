const { SlashCommandBuilder } = require('@discordjs/builders')
const superagent = require('superagent')

async function reqSciHub(query) {
    return new Promise((resolve, reject) => {
        superagent
            .post('https://sci-hub.se/')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            // this might be problematic but we will see
            .set('Cache-Control', 'no-cache')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')
            .set('Accept', '*/*')
            .set('Accept-Encoding', 'gzip, deflate, br')
            .set('Connection', 'keep-alive')
            .set('Host', 'sci-hub.se')
            // end of potential problems
            .send(JSON.parse(`{
        "request": "${query}"
    }`))
            .redirects(2)
            .end((err, res) => {
                if (err) console.error(err)
                try {
                    resolve((res.text.match(/src="(.*?)" id = "pdf"/)[1].trim().replace('//', 'https://').replace('"', '')).includes('sci-hub') ? res.text.match(/src="(.*?)" id = "pdf"/)[1].trim().replace('//', 'https://').replace('"', '') : `https://sci-hub.se${res.text.match(/src="(.*?)" id = "pdf"/)[1].trim().replace('//', 'https://').replace('"', '')}`)
                } catch (err) {
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
