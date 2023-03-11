const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const Discord = require('discord.js')

router.post('/', async (req, resApp) => {
    function hash(apiKey) {
        return crypto.createHash('sha256').update(apiKey).digest('hex')
    }
    if (hash(req.body.auth) !== process.env.BOTEXPRESSAUTH) {
        return resApp.status(401).send('Invalid API Key or no authentication provided.')
    }

    const client = req.app.get('client')
    /* schema:
         subject: msg.subject,
        bye: false,
        byeTeam: null,
        searchTeam1: combinedTeamsArr[0],
        searchTeam2: combinedTeamsArr[1],
        sidelock: sidelock,
        flip: flip,
        competitionTeamsStr: competitionTeamsStr,
        judging: judges,
        start: start,
        flight: flightNum || false,
        room: room,
        extraInfo: messages,
        map: map,
        notify: ,
        tournName: ,
    */

    if (req.body.bye) {
        const byeEmbed = new Discord.EmbedBuilder()
            .setColor('#daeaf1')
            .setTitle(`${req.body.subject} Pairings`)
            .setDescription(`**${req.body.byeTeam} BYE**`)
            .setTimestamp(new Date())
            .setFooter({
                text: req.body.tournName
            })

        resApp.status(200).send('OK')
        var notifyArr = req.body.notify
        for (const server of notifyArr) {
            var sendGuild = await client.guilds.fetch(server.server)
            if (sendGuild.available) {
                var guildChannels = await sendGuild.channels.fetch(server.channel)
                try {
                    var tagging = server.users.map(user => `<@${user}>`).join(', ') + '\n' + (server.role !== null ? `<@&${server.role}>` : '')
                    guildChannels.send({ content: tagging, embeds: [byeEmbed] })
                } catch (err) {
                    console.error(err)
                }
            }
        }
    } else if (!req.body.bye) {
        const pairingsEmbed = new Discord.EmbedBuilder()
            .setColor('#daeaf1')
            .setTitle(`${req.body.subject} Pairings`)
            .addFields(
                { name: 'Competition', value: req.body.competitionTeamsStr, inline: false }
            )
            .setTimestamp(new Date())
            .setFooter({
                text: req.body.tournName
            })
        if (req.body.sidelock) {
            pairingsEmbed.addFields({ name: 'Side lock?', value: 'Yes', inline: false })
        }
        if (req.body.flip) {
            pairingsEmbed.addFields({ name: 'Flip?', value: 'Yes', inline: false })
        }
        pairingsEmbed.addFields(
            { name: 'Judging', value: req.body.judging.join(', '), inline: false },
            { name: 'Start Time', value: req.body.start, inline: false }
        )
        if (req.body.flight) {
            pairingsEmbed.addFields({ name: 'Flight', value: req.body.flight, inline: false })
        }
        pairingsEmbed.addFields(
            { name: 'Room', value: req.body.room, inline: false }
        )
        if (req.body.extraInfo) {
            pairingsEmbed.addFields({ name: 'Extra Info', value: req.body.extraInfo, inline: false })
        }
        if (req.body.map) {
            pairingsEmbed.addFields({ name: 'Map', value: req.body.map, inline: false })
        }

        resApp.status(200).send('OK')
        var notifyArr = req.body.notify
        for (const server of notifyArr) {
            var sendGuild = await client.guilds.fetch(server.server)
            if (sendGuild.available) {
                var guildChannels = await sendGuild.channels.fetch(server.channel)
                try {
                    var tagging = server.users.map(user => `<@${user}>`).join(', ') + '\n' + (server.role !== null ? `<@&${server.role}>` : '')
                    guildChannels.send({ content: tagging, embeds: [pairingsEmbed] })
                } catch (err) {
                    console.error(err)
                }
            }
        }
    }
})

module.exports = router
