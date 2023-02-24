const { SlashCommandBuilder } = require('discord.js')
const axios = require('axios').default
const qs = require('qs')
const Discord = require('discord.js')

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

        const bookType = interaction.options.getString('type')
        const search = interaction.options.getString('isbn-or-name')
        const bookEmbed = new Discord.EmbedBuilder()
            .setColor('#a00000')
            .setTimestamp(new Date())
        interaction.reply('Fetching...')
        try {
            axios.post(`${process.env.BLAZEDGEURL}/book`, qs.stringify({ // pointing to old cloudflare workers api TODO: split this into separate repo & redeploy on cf workers
                query: search,
                params: bookType
            }), {
                'Content-Type': 'application/x-www-form-urlencoded'
            }).then((res) => {
                if (res.data.length > 0 && res.status === 200) { // there is content
                    bookEmbed.setTitle(res.data[2].title)
                    bookEmbed.setDescription(`[Access Book (1st result)](${res.data[0]}) | [Other Listings](${res.data[1]})`)
                    bookEmbed.setURL(res.data[0])
                    bookEmbed.addFields({ name: 'ISBN(s)', value: (res.data[2].isbn) ? res.data[2].isbn : 'No ISBNs available' },
                        { name: 'Author(s)', value: (res.data[2].author) ? res.data[2].author : 'No author data available' },
                        { name: 'Publisher', value: (res.data[2].publisher) ? res.data[2].publisher : 'No publisher data available' },
                        { name: 'Year Published', value: (res.data[2].year) ? res.data[2].year : 'No publishing date available' },
                        { name: 'LibGen ID', value: (res.data[2].libgenID) ? res.data[2].libgenID : 'No LibGen ID' },
                        { name: 'Original Query', value: `${search} | ${bookType}` })
                    bookEmbed.setFooter({
                        text: `Requested by ${interaction.user.tag}`,
                        icon_url: interaction.user.avatarURL()
                    })
                    interaction.fetchReply().then(async () => {
                        interaction.editReply({ content: 'Got it! The link of the title and "Access Book" are for the 1st results on Library Genesis. To see all the results, use the "Other Listings" link.', embeds: [bookEmbed] })
                    })
                } else {
                    bookEmbed.setTitle('Error')
                    bookEmbed.setDescription('Not found. If you used the ISBN try using the book name (and vice versa). If there are multiple ISBNs for a book (due to paperback, ebook, etc.) try those ISBNs as well.')
                    bookEmbed.addFields({ name: 'Original Query', value: `${search} | ${bookType}` })
                    interaction.fetchReply().then(async () => {
                        interaction.editReply({ embeds: [bookEmbed] })
                    })
                }
            }).catch((err) => {
                console.error(err)
                bookEmbed.setTitle('Error')
                bookEmbed.setDescription('Not found. If you used the ISBN try using the book name (and vice versa). If there are multiple ISBNs for a book (due to paperback, ebook, etc.) try those ISBNs as well.')
                bookEmbed.addFields({ name: 'Original Query', value: `${search} | ${bookType}` })
                interaction.fetchReply().then(async () => {
                    interaction.editReply({ embeds: [bookEmbed] })
                })
            })
        } catch (e) {
            bookEmbed.setTitle('Error')
            bookEmbed.setDescription('Not found. If you used the ISBN try using the book name (and vice versa). If there are multiple ISBNs for a book (due to paperback, ebook, etc.) try those ISBNs as well.')
            bookEmbed.addFields({ name: 'Original Query', value: `${search} | ${bookType}` })
            interaction.fetchReply().then(async () => {
                interaction.editReply({ embeds: [bookEmbed] })
            })
        }
    }
}
