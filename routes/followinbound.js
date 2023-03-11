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
    console.log(req.body)
    const body = JSON.parse(req.body)
    if (body.bye === 'true') {
        const byeEmbed = new Discord.EmbedBuilder()
            .setColor('#daeaf1')
            .setTitle(`${body.subject} Pairings`)
            .setDescription(`**${body.byeTeam} BYE**`)
            .setTimestamp(new Date())
            .setFooter({
                text: body.tournName
            })

        resApp.status(200).send('OK')
        var notifyArr = body.notify
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
    } else if (body.bye === 'false') {
        const pairingsEmbed = new Discord.EmbedBuilder()
            .setColor('#daeaf1')
            .setTitle(`${body.subject} Pairings`)
            .addFields(
                { name: 'Competition', value: body.competitionTeamsStr, inline: false }
            )
            .setTimestamp(new Date())
            .setFooter({
                text: body.tournName
            })
        if (body.sidelock === 'true') {
            pairingsEmbed.addFields({ name: 'Side lock?', value: 'Yes', inline: false })
        }
        if (body.fli === 'true') {
            pairingsEmbed.addFields({ name: 'Flip?', value: 'Yes', inline: false })
        }
        pairingsEmbed.addFields(
            { name: 'Judging', value: body.judging.join(', '), inline: false },
            { name: 'Start Time', value: body.start, inline: false }
        )
        if (body.flight !== 'false') {
            pairingsEmbed.addFields({ name: 'Flight', value: body.flight, inline: false })
        }
        pairingsEmbed.addFields(
            { name: 'Room', value: body.room, inline: false }
        )
        if (body.extraInfo) {
            pairingsEmbed.addFields({ name: 'Extra Info', value: body.extraInfo, inline: false })
        }
        if (body.map) {
            pairingsEmbed.addFields({ name: 'Map', value: body.map, inline: false })
        }

        resApp.status(200).send('OK')
        var notifyArr = body.notify
        for (const server of notifyArr) {
            var sendGuild = await client.guilds.fetch(server.server)
            if (sendGuild.available) {
                var guildChannels = await sendGuild.channels.fetch(server.channel)
                try {
                    var tagging = server.users.map(user => `<@${user}>`).join(', ') + '\n' + (server.role !== 'null' ? `<@&${server.role}>` : '')
                    guildChannels.send({ content: tagging, embeds: [pairingsEmbed] })
                } catch (err) {
                    console.error(err)
                }
            }
        }
    }
})

module.exports = router
