const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const superagent = require('superagent')

async function judgeAnalytics(judgeRecordsRaw, judgeEmail) {
    var returnResult = {
        cx: {
            totalRounds: 0,
            roundsLastYr: 0,
            totalPanels: 0,
            totalAffVote: 0,
            totalNegVote: 0,
            affVoteLastYr: 0,
            negVoteLastYr: 0
        },
        pf: {
            totalRounds: 0,
            roundsLastYr: 0,
            totalPanels: 0,
            totalAffVote: 0,
            totalNegVote: 0,
            affVoteLastYr: 0,
            negVoteLastYr: 0
        },
        ld: {
            totalRounds: 0,
            roundsLastYr: 0,
            totalPanels: 0,
            totalAffVote: 0,
            totalNegVote: 0,
            affVoteLastYr: 0,
            negVoteLastYr: 0
        },
        total: {
            judgeEmail,
            totalRounds: 0,
            roundsLastYr: 0,
            judgingYrs: 0,
            judgingSince: 0,
            totalPanels: 0,
            totalAffVote: 0,
            totalNegVote: 0,
            affVoteLastYr: 0,
            negVoteLastYr: 0,
            tocExperience: [] // will .join(', ') later
        }
    }

    // defined events
    const cxSearch = ['ncx', 'jvcx', 'vcx', 'varcx', 'op', 'cx', 'open', 'jv', 'o cx', 'ocx', 'cx rr', 'pol', 'pol v', 'pol jv', 'pol n', 'nov', 'rr cx', 'rrcx', 'cxrr', 'novice', 'jv cx', 'n cx'] // 2wk, 3wk go in total
    const pfSearch = ['npf', 'jvpf', 'vpf', 'varpf', 'pf', 'pufo', 'publicforum', 'pfs', 'pfg', 'pf rr', 'rr pf', 'pfrr', 'rrpf', 'npufo', 'varpufo', 'jvpufo', 'gpf', 'spf', 'jv pf', 'n pf', 'v pf']
    const ldSearch = ['tld', 'ld rr', 'rr ld', 'ldrr', 'rrld', 'old', 'vld', 'nld', 'jvld', 'ldjv', 'ldn', 'ldv', 'jv ld', 'n ld', 'v ld']
    const affSearch = ['pro', 'aff']
    const negSearch = ['con', 'neg']

    // # of yrs between first rd judged and last rd judged
    const mostRecentTournamentDateUnix = judgeRecordsRaw[0].Date.substring(0, judgeRecordsRaw[0].Date.indexOf('\n'))
    const oldestTournamentDateUnix = judgeRecordsRaw[judgeRecordsRaw.length - 1].Date.substring(0, judgeRecordsRaw[judgeRecordsRaw.length - 1].Date.indexOf('\n'))
    // convert seconds to years
    returnResult.total.judgingYrs = ((parseInt(mostRecentTournamentDateUnix) - parseInt(oldestTournamentDateUnix)) / 31536000).toFixed(4)
    // judging since
    returnResult.total.judgingSince = judgeRecordsRaw[judgeRecordsRaw.length - 1].Date
    returnResult.total.judgingSince = returnResult.total.judgingSince.substring(parseInt(returnResult.total.judgingSince.lastIndexOf('\t') + 1))

    for (const record of judgeRecordsRaw) {
        /*
        things to check:
        - judge email regex
        - # of rounds in total & in specific events
        - diff # of yrs between first rd judged and last rd judged
        - # of rds judged in the last yr
        - panel experience
        - aff/neg bias in each event & in total & in each event for the past yr
        - toc experience
        */

        // # of rounds in total & in spec events
        // if rd was in last yr
        const roundDateUnix = record.Date.substring(0, record.Date.indexOf('\n'))
        const oneYrAgoUnix = Math.floor(Date.now() / 1000) - 31536000

        if (cxSearch.includes(record.Ev.replace(/\n/g).replace(/\t/g).toLowerCase())) {
            // total rounds & total event specific rounds
            returnResult.cx.totalRounds++
            returnResult.total.totalRounds++
            // aff neg bias
            if (affSearch.includes(record.Vote.toLowerCase())) {
                returnResult.cx.totalAffVote++
                returnResult.total.totalAffVote++
                // if rd was in last yr
                if (roundDateUnix >= oneYrAgoUnix) {
                    returnResult.cx.roundsLastYr++
                    returnResult.total.roundsLastYr++
                    returnResult.cx.affVoteLastYr++
                    returnResult.total.affVoteLastYr++
                }
            } else if (negSearch.includes(record.Vote.toLowerCase())) {
                returnResult.cx.totalNegVote++
                returnResult.total.totalNegVote++
                // if rd was in last yr
                if (roundDateUnix >= oneYrAgoUnix) {
                    returnResult.cx.roundsLastYr++
                    returnResult.total.roundsLastYr++
                    returnResult.cx.negVoteLastYr++
                    returnResult.total.negVoteLastYr++
                }
            }
            // panel experience
            if (record.Result !== '') {
                returnResult.cx.totalPanels++
                returnResult.total.totalPanels++
            }
            // toc experience
            if (record.Tournament === 'Tournament of Champions') {
                if (!returnResult.total.tocExperience.includes('Policy')) returnResult.total.tocExperience.push('Policy')
            }
        } else if (pfSearch.includes(record.Ev.replace(/\n/g).replace(/\t/g).toLowerCase())) {
            returnResult.pf.totalRounds++
            returnResult.total.totalRounds++

            if (affSearch.includes(record.Vote.toLowerCase())) {
                returnResult.pf.totalAffVote++
                returnResult.total.totalAffVote++
                if (roundDateUnix >= oneYrAgoUnix) {
                    returnResult.pf.roundsLastYr++
                    returnResult.total.roundsLastYr++
                    returnResult.pf.affVoteLastYr++
                    returnResult.total.affVoteLastYr++
                }
            } else if (negSearch.includes(record.Vote.toLowerCase())) {
                returnResult.pf.totalNegVote++
                returnResult.total.totalNegVote++
                if (roundDateUnix >= oneYrAgoUnix) {
                    returnResult.pf.roundsLastYr++
                    returnResult.total.roundsLastYr++
                    returnResult.pf.negVoteLastYr++
                    returnResult.total.negVoteLastYr++
                }
            }

            if (record.Result !== '') {
                returnResult.pf.totalPanels++
                returnResult.total.totalPanels++
            }

            if (record.Tournament === 'Tournament of Champions') {
                if (!returnResult.total.tocExperience.includes('Public Forum')) returnResult.total.tocExperience.push('Public Forum')
            }
        } else if (ldSearch.includes(record.Ev.replace(/\n/g).replace(/\t/g).toLowerCase())) {
            returnResult.ld.totalRounds++
            returnResult.total.totalRounds++

            if (affSearch.includes(record.Vote.toLowerCase())) {
                returnResult.ld.totalAffVote++
                returnResult.total.totalAffVote++
                if (roundDateUnix >= oneYrAgoUnix) {
                    returnResult.ld.roundsLastYr++
                    returnResult.total.roundsLastYr++
                    returnResult.ld.affVoteLastYr++
                    returnResult.total.affVoteLastYr++
                }
            } else if (negSearch.includes(record.Vote.toLowerCase())) {
                returnResult.ld.totalNegVote++
                returnResult.total.totalNegVote++
                if (roundDateUnix >= oneYrAgoUnix) {
                    returnResult.ld.roundsLastYr++
                    returnResult.total.roundsLastYr++
                    returnResult.ld.negVoteLastYr++
                    returnResult.total.negVoteLastYr++
                }
            }

            if (record.Result !== '') {
                returnResult.ld.totalPanels++
                returnResult.total.totalPanels++
            }

            if (record.Tournament === 'Tournament of Champions') {
                if (!returnResult.total.tocExperience.includes('Lincoln Douglas')) returnResult.total.tocExperience.push('Lincoln Douglas')
            }
        } else {
            returnResult.total.totalRounds++

            if (affSearch.includes(record.Vote.toLowerCase())) {
                returnResult.total.totalAffVote++
                if (roundDateUnix >= oneYrAgoUnix) {
                    returnResult.total.roundsLastYr++
                    returnResult.total.affVoteLastYr++
                }
            } else if (negSearch.includes(record.Vote.toLowerCase())) {
                returnResult.total.totalNegVote++
                if (roundDateUnix >= oneYrAgoUnix) {
                    returnResult.total.roundsLastYr++
                    returnResult.total.negVoteLastYr++
                }
            }

            if (record.Result !== '') {
                returnResult.total.totalPanels++
            }

            if (record.Tournament === 'Tournament of Champions') {
                if (!returnResult.total.tocExperience.includes('Other Event')) returnResult.total.tocExperience.push('Other Event')
            }
        }
    }
    returnResult.total.tocExperience = returnResult.total.tocExperience.join(', ')
    if (returnResult.total.tocExperience === '') returnResult.total.tocExperience = 'None'
    return (returnResult)
}

async function buildEmbed(name, judgeInfo, paradigmLink) {
    const embed0 = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Judging Record Analysis: ${name}`)
        .setURL(paradigmLink)
        .addFields(
            { name: 'Judge Contact', value: '========================================' },
            { name: 'Judge Email', value: `${'' + judgeInfo.total.judgeEmail}`, inline: true },
            { name: 'Paradigm Link', value: `[Here](${paradigmLink})`, inline: true },
            { name: '‎\nAt a Glance: Lifetime Totals', value: '========================================' },
            { name: 'Total Rounds Judged', value: `${'' + judgeInfo.total.totalRounds}`, inline: true },
            { name: 'Total Aff/Pro Vote Count', value: `${'' + judgeInfo.total.totalAffVote} (${((judgeInfo.total.totalAffVote + judgeInfo.total.totalNegVote) > 0) ? (((judgeInfo.total.totalAffVote / (judgeInfo.total.totalAffVote + judgeInfo.total.totalNegVote)) * 100).toFixed(2)) : '0'}% of Total Rounds)`, inline: true },
            { name: 'Total Neg/Con Vote Count', value: `${'' + judgeInfo.total.totalNegVote} (${((judgeInfo.total.totalAffVote + judgeInfo.total.totalNegVote) > 0) ? (((judgeInfo.total.totalNegVote / (judgeInfo.total.totalAffVote + judgeInfo.total.totalNegVote)) * 100).toFixed(2)) : '0'}% of Total Rounds)`, inline: true },
            { name: 'Total Panels Participated On', value: `${'' + judgeInfo.total.totalPanels}`, inline: true },
            { name: 'TOC Judging Experience in the Following Events', value: `${'' + judgeInfo.total.tocExperience}`, inline: true },
            { name: 'Judging Since', value: `${'' + judgeInfo.total.judgingSince} (${'' + judgeInfo.total.judgingYrs} Years)`, inline: true },
            { name: '‎\nAt a Glance: Last Calendar Year', value: '========================================' },
            { name: 'Total Rounds Judged Last Calendar Year', value: `${'' + judgeInfo.total.roundsLastYr} (${(judgeInfo.total.totalRounds > 0) ? (((judgeInfo.total.roundsLastYr / judgeInfo.total.totalRounds) * 100).toFixed(2)) : '0'}% of Lifetime Rounds)`, inline: true },
            { name: 'Aff/Pro Votes Last Calendar Year', value: `${'' + judgeInfo.total.affVoteLastYr} (${(judgeInfo.total.roundsLastYr > 0) ? (((judgeInfo.total.affVoteLastYr / judgeInfo.total.roundsLastYr) * 100).toFixed(2)) : '0'}% of Rounds Last Calendar Yr)`, inline: true },
            { name: 'Neg/Con Votes Last Calendar Year', value: `${'' + judgeInfo.total.negVoteLastYr} (${(judgeInfo.total.roundsLastYr > 0) ? (((judgeInfo.total.negVoteLastYr / judgeInfo.total.roundsLastYr) * 100).toFixed(2)) : '0'}% of Rounds Last Calendar Yr)`, inline: true })
        .setFooter({ text: 'Information from Tabroom.com' })
        .setTimestamp()
    const embed1 = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Judging Record Analysis: ${name}`)
        .setURL(paradigmLink)
        .addFields(
            { name: '\nIn Detail: Policy/CX Debate', value: '========================================' },
            { name: 'Total Lifetime Rounds Judged', value: `${'' + judgeInfo.cx.totalRounds}`, inline: true },
            { name: 'Total Lifetime Aff Votes', value: `${'' + judgeInfo.cx.totalAffVote} (${(judgeInfo.cx.totalRounds > 0) ? (((judgeInfo.cx.totalAffVote) / judgeInfo.cx.totalRounds) * 100).toFixed(2) : '0'}% of Total Rounds)`, inline: true },
            { name: 'Total Lifetime Neg Votes', value: `${'' + judgeInfo.cx.totalNegVote} (${(judgeInfo.cx.totalRounds > 0) ? (((judgeInfo.cx.totalNegVote) / judgeInfo.cx.totalRounds) * 100).toFixed(2) : '0'}% of Total Rounds)`, inline: true },
            { name: 'Total Panels Participated On', value: `${'' + judgeInfo.cx.totalPanels}`, inline: true },
            { name: 'Rounds Judged Last Calendar Year', value: `${'' + judgeInfo.cx.roundsLastYr}`, inline: true },
            { name: 'Aff Votes Last Calendar Year', value: `${'' + judgeInfo.cx.affVoteLastYr} (${(judgeInfo.cx.roundsLastYr > 0) ? ((judgeInfo.cx.affVoteLastYr / judgeInfo.cx.roundsLastYr) * 100).toFixed(2) : '0'}% of Rounds last Calendar Yr)`, inline: true },
            { name: 'Neg Votes Last Calendar Year', value: `${'' + judgeInfo.cx.negVoteLastYr} (${(judgeInfo.cx.roundsLastYr > 0) ? ((judgeInfo.cx.negVoteLastYr / judgeInfo.cx.roundsLastYr) * 100).toFixed(2) : '0'}% of Rounds last Calendar Yr)`, inline: true },
            { name: '‎\nIn Detail: Public Forum/PF Debate', value: '========================================' },
            { name: 'Total Lifetime Rounds Judged', value: `${'' + judgeInfo.pf.totalRounds}`, inline: true },
            { name: 'Total Lifetime Aff/Pro Votes', value: `${'' + judgeInfo.pf.totalAffVote} (${(judgeInfo.pf.totalRounds > 0) ? (((judgeInfo.pf.totalAffVote) / judgeInfo.pf.totalRounds) * 100).toFixed(2) : '0'}% of Total Rounds)`, inline: true },
            { name: 'Total Lifetime Neg/Con Votes', value: `${'' + judgeInfo.pf.totalNegVote} (${(judgeInfo.pf.totalRounds > 0) ? (((judgeInfo.pf.totalNegVote) / judgeInfo.pf.totalRounds) * 100).toFixed(2) : '0'}% of Total Rounds)`, inline: true },
            { name: 'Total Panels Participated On', value: `${'' + judgeInfo.pf.totalPanels}`, inline: true },
            { name: 'Rounds Judged Last Calendar Year', value: `${'' + judgeInfo.pf.roundsLastYr}`, inline: true },
            { name: 'Aff/Pro Votes Last Calendar Year', value: `${'' + judgeInfo.pf.affVoteLastYr} (${(judgeInfo.pf.roundsLastYr > 0) ? ((judgeInfo.pf.affVoteLastYr / judgeInfo.pf.roundsLastYr) * 100).toFixed(2) : '0'}% of Rounds last Calendar Yr)`, inline: true },
            { name: 'Neg/Con Votes Last Calendar Year', value: `${'' + judgeInfo.pf.negVoteLastYr} (${(judgeInfo.pf.roundsLastYr > 0) ? ((judgeInfo.pf.negVoteLastYr / judgeInfo.pf.roundsLastYr) * 100).toFixed(2) : '0'}% of Rounds last Calendar Yr)`, inline: true },
            { name: '‎\nIn Detail: Lincoln Douglas Debate', value: '========================================' },
            { name: 'Total Lifetime Rounds Judged', value: `${'' + judgeInfo.ld.totalRounds}`, inline: true },
            { name: 'Total Lifetime Aff Votes', value: `${'' + judgeInfo.ld.totalAffVote} (${(judgeInfo.ld.totalRounds > 0) ? (((judgeInfo.ld.totalAffVote) / judgeInfo.ld.totalRounds) * 100).toFixed(2) : '0'}% of Total Rounds)`, inline: true },
            { name: 'Total Lifetime Neg Votes', value: `${'' + judgeInfo.ld.totalNegVote} (${(judgeInfo.ld.totalRounds > 0) ? (((judgeInfo.ld.totalNegVote) / judgeInfo.ld.totalRounds) * 100).toFixed(2) : '0'}% of Total Rounds)`, inline: true },
            { name: 'Total Panels Participated On', value: `${'' + judgeInfo.ld.totalPanels}`, inline: true },
            { name: 'Rounds Judged Last Calendar Year', value: `${'' + judgeInfo.ld.roundsLastYr}`, inline: true },
            { name: 'Aff Votes Last Calendar Year', value: `${'' + judgeInfo.ld.affVoteLastYr} (${(judgeInfo.ld.roundsLastYr > 0) ? ((judgeInfo.ld.affVoteLastYr / judgeInfo.ld.roundsLastYr) * 100).toFixed(2) : '0'}% of Rounds last Calendar Yr)`, inline: true },
            { name: 'Neg Votes Last Calendar Year', value: `${'' + judgeInfo.ld.negVoteLastYr} (${(judgeInfo.ld.roundsLastYr > 0) ? ((judgeInfo.ld.negVoteLastYr / judgeInfo.ld.roundsLastYr) * 100).toFixed(2) : '0'}% of Rounds last Calendar Yr)`, inline: true })
        .setFooter({ text: 'Information from Tabroom.com' })
        .setTimestamp()
    return ([embed0, embed1])
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('judgeinfo')
        .setDescription('Fetch judge information from Tabroom.com')
        .addSubcommand(subcommand =>
            subcommand
                .setName('name')
                .setDescription('Search by judge first & last name')
                .addStringOption(option =>
                    option.setName('firstname')
                        .setDescription('Input judge first name')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('lastname')
                        .setDescription('Input judge last name')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('id')
                .setDescription('Search by judge ID')
                .addStringOption(option =>
                    option.setName('judgeid')
                        .setDescription('Input judge ID')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('link')
                .setDescription('Search by judge paradigm link')
                .addStringOption(option =>
                    option.setName('judgelink')
                        .setDescription('Input judge paradigm link')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        var paradigmLink

        // check type of cmd + construct request query
        const payload = {
            auth: process.env.TABAPIKEY
        }
        switch (interaction.options.getSubcommand()) {
        case 'name':
            payload.type = 'name'
            payload.first = interaction.options.getString('firstname')
            payload.last = interaction.options.getString('lastname')
            paradigmLink = `https://www.tabroom.com/index/paradigm.mhtml?search_first=${payload.first}&search_last=${payload.last}`
            break
        case 'id':
            payload.type = 'id'
            payload.id = interaction.options.getString('judgeid')
            paradigmLink = `https://www.tabroom.com/index/paradigm.mhtml?judge_person_id=${payload.id}}`
            break
        case 'link':
            payload.type = 'link'
            payload.link = interaction.options.getString('judgelink')
            paradigmLink = payload.link
            break
        }

        superagent
            .post(`${process.env.TABURL}/paradigm`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(payload)
            .end(async (err, res) => {
                if (err) console.error(err)
                let interactionReply = false
                for (const result of res.body) { // for each judge
                    // const result = res.body[i]
                    let paradigmRaw = result.paradigm
                    const judgeRecordsRaw = result.judgeRecords[0]
                    const name = result.name
                    // eslint-disable-next-line no-control-regex, no-useless-escape
                    var judgeEmail = (paradigmRaw.toLowerCase().match(/(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g) || 'None')
                    if (judgeEmail !== 'None') judgeEmail = judgeEmail[0]

                    if (paradigmRaw.length !== 0) {
                        // parse paradigm into 2000 char chunks ending on whole sentences
                        const paradigm = []
                        while (paradigmRaw.length > 2000) {
                            const chunk = paradigmRaw.substring(0, 2000)
                            if ((paradigmRaw.match(/\n/g) || []).length > 13) { // \n > 13 then try to split on \n. there are 7 \n in default headers
                                const lastBreakEnd = parseInt(chunk.lastIndexOf('\n') + 1) // +2 to add the period and space
                                paradigm.push(paradigmRaw.substring(0, lastBreakEnd))
                                paradigmRaw = paradigmRaw.substring(lastBreakEnd)
                            } else {
                                const lastSentenceEnd = parseInt(chunk.lastIndexOf('. ') + 2) // +2 to add the period and space
                                paradigm.push(paradigmRaw.substring(0, lastSentenceEnd))
                                paradigmRaw = paradigmRaw.substring(lastSentenceEnd)
                            }
                        }
                        paradigm.push(paradigmRaw)
                        const judgeInfo = await judgeAnalytics(judgeRecordsRaw, judgeEmail)
                        // build the embed
                        const embedSend = await buildEmbed(name, judgeInfo, paradigmLink)
                        // send!
                        if (!interactionReply) {
                            interaction.reply('```md\nParadigm for ' + name + '\n==========```')
                            interactionReply = true
                        } else {
                            interaction.channel.send('```md\nParadigm for ' + name + '\n==========```')
                        }
                        for (const element of paradigm) {
                            interaction.channel.send(element)
                        }
                        interaction.channel.send({ embeds: [embedSend[0]] })
                        interaction.channel.send({ embeds: [embedSend[1]] })
                    } else {
                        if (!interactionReply) {
                            interaction.reply('```md\nNo paradigm text found for ' + name + '\n==========```')
                            interactionReply = true
                        } else {
                            interaction.channel.send('```md\nNo paradigm text found for ' + name + '\n==========```')
                        }
                        if (judgeRecordsRaw.length > 0) { // no paradigm text but they have a judging record (reverse is not possible: can't have a paradigm without a judging record)
                            const judgeInfo = await judgeAnalytics(judgeRecordsRaw, judgeEmail)
                            // build the embed
                            const embedSend = await buildEmbed(name, judgeInfo, paradigmLink)
                            interaction.channel.send({ embeds: [embedSend[0]] })
                            interaction.channel.send({ embeds: [embedSend[1]] })
                        }
                    }
                }
            })
    }
}
