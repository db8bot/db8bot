const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const Discord = require('discord.js')

router.post('/', async (req, resApp) => {
    function hash(apiKey) {
        return crypto.createHash('sha256').update(apiKey).digest('hex')
    }
    if (hash(req.body[0].auth) !== process.env.BOTEXPRESSAUTH) {
        return resApp.status(401).send('Invalid API Key or no authentication provided.')
    }

    /*
        schema:
        result: {
    type: string;
    multiLink: any;
    link: any; }
    */

    const director = req.body[0]
    const result = req.body[1]
    const metadata = req.body[2] // only avilable if found

    const getEmbed = new Discord.EmbedBuilder()
        .setColor('#8b0000')
        .setTimestamp(new Date())
    if (result !== 'not found') { // if found - metadata is accessible, result is an obj - assemble embed
        var authors
        if (metadata.authors) {
            authors = metadata.authors.map(author => author.given + ' ' + author.family).join(', ')
        } else {
            authors = null
        }

        getEmbed.setTitle((metadata.title) ? metadata.title : 'Requested Article (No Title)')
        if (result.multiLink) { // multiple entries, - dual links
            getEmbed.setDescription(`[Access Book (1st result)](${result.link}) | [Other Listings](${result.multiLink})`)
        } else {
            getEmbed.setDescription('[Access Article](' + result.link + ')')
        }
        getEmbed.setURL(result.link)
        getEmbed.addFields({ name: 'Journal/Container', value: (metadata.containerTitle) ? metadata.containerTitle : 'No Container Title' }
            , { name: 'DOI', value: (metadata.doi) ? metadata.doi : 'No DOI' },
            { name: 'Issued Year', value: (metadata.issuedYear) ? '' + metadata.issuedYear : 'No Issue Year', inline: true },
            { name: 'Issued Month', value: (metadata.issuedMonth) ? '' + metadata.issuedMonth : 'No Issue Month', inline: true },
            { name: 'Volume', value: (metadata.volume) ? metadata.volume : 'No Volume #' },
            { name: 'Issue', value: (metadata.issue) ? metadata.issue : 'No Issue #', inline: true },
            { name: 'Author(s)', value: (authors) || 'No Authors Found' },
            { name: 'Original Query', value: director.source })
        getEmbed.setFooter({
            text: `Requested by ${director.tag}`
        })

        const content = {
            content: `<@${director.serverID ? director.memberID : director.dmUser}> | Get Job: \`${director.jobID}\` | Execution Time: \`${Date.now() - director.time}ms\``,
            embeds: [getEmbed],
            files: [{ attachment: result.link, name: (metadata.title) ? `${metadata.title}.pdf` : 'Requested Article.pdf' }]
        }

        require('../modules/channelSend').channelSendSingleGuildSingleUser(req.app.get('client'), director, content)
        resApp.status(200).send('OK')
    } else { // result is a string
        getEmbed.setTitle('Error')
        getEmbed.setDescription('No results found. If the article has a DOI, you should try using that (both the doi.org link and just the DOI). You should also try setting the paper\'s title as the source. Sometimes an journal/article is stored under different identifiers in the database.\nIf you are searching a book, use `/getbook`.`')
        getEmbed.addFields({ name: 'Original Query', value: director.source })
        const content = {
            content: `<@${director.serverID ? director.memberID : director.dmUser}> | Get Job: \`${director.jobID}\` | Execution Time: \`${Date.now() - director.time}ms\``,
            embeds: [getEmbed]
        }
        require('../modules/channelSend').channelSendSingleGuildSingleUser(req.app.get('client'), director, content)
        resApp.status(200).send('OK')
    }
})

module.exports = router
