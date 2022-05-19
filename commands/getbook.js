const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios').default
const qs = require('qs')
const cheerio = require('cheerio')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getbook')
        .setDescription('Get a book')
        .addStringOption(option =>
            option.setName('isbn-or-name')
                .setDescription('ISBN or name of book')
                .setRequired(true)

        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Non-fiction or fiction')
                .setRequired(true)
                .addChoices({ name: 'fiction', value: 'fiction' }, { name: 'non-fiction', value: 'nonfiction' })
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)

        const bookType = interaction.option.getString('type')
        const search = interaction.options.getString('isbn-or-name')
        try {
            axios.post('https://db8bot.uc.r.appspot.com/get/book', qs.stringify({
                query: search,
                params: bookType
            }), {
                'Content-Type': 'application/x-www-form-urlencoded'
            }).then((res) => {
                if (res.data.length > 0) { // there is content
                    interaction.reply(`${res.data[0]}\nSee the full catalogue at ${res.data[1]}`)
                } else {
                    interaction.reply('Not found. If you used the ISBN try using the book name (and vice versa). If there are multiple ISBNs for a book (due to paperback, ebook, etc.) try those ISBNs as well.')
                }
            })
        } catch (e) {
            interaction.reply('Not found. If you used the ISBN try using the book name (and vice versa). If there are multiple ISBNs for a book (due to paperback, ebook, etc.) try those ISBNs as well.')
        }
    }
}
