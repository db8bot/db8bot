exports.run = function (client, message, args) {
    client.logger.log('info', `startround command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
    const currentlyDebating = message.guild.roles.cache.find(role => role.name === "Currently Debating");
    const currentlyJudging = message.guild.roles.cache.find(role => role.name === "Currently Judging")
    var guild = message.guild;
    var debateConfig;
    var debaters = "";
    var debatersObj = [];
    const Discord = require('discord.js');
    const config = client.config;
    if (args.join(" ") === "" || (args[args.length - 1].indexOf('<@!') != -1) || (args[args.length - 2].indexOf('<@!')) != -1 || args.length < 5) {
        const help = new Discord.MessageEmbed()
            .setColor("#f0ffff")
            .setDescription("**Command: **" + `${config.prefix}startround`)
            .addField("**Usage:**", `${config.prefix}startround <Mentioned debaters in the order of AFF to NEG seperated by a space per debater> <Mentioned judge: Only supports 1 judge> <Type of event: policy/cx/pol, ld/douglas, pf/pufo/forum> <Round name: No spaces allowed in the name!>`)
            .addField("**Example:**", `${config.prefix}startround @AirFusion @Bob @Nick @David @JudgeMary policy AF-v-ND`)
            .addField("**Expected Result From Example:**", "Bot returns round started message with round information.")
            .addField('**NOTES**', `The bot also supports currently debating and currently judging roles to be added to debaters and judges. Create two roles "Currently Debating" and "Currently Judging" to use this function. Make sure these two roles are below the bot's role.`)
        message.channel.send({ embed: help })
        return;
    } else {
        try {
            for (var i = 0; i < args.length - 3; i++) {
                guild.member(message.mentions.users.array()[i]).roles.add(currentlyDebating).catch(err => console.log(err))
                debaters += message.mentions.users.array()[i] + " "
                debatersObj += `${guild.member(message.mentions.users.array()[i])} `
            }
            guild.member(message.mentions.users.array()[args.length - 3]).roles.add(currentlyJudging).catch(err => console.log(err))

            debateConfig = {
                type: args[args.length - 2],
                name: args[args.length - 1],
                judge: message.mentions.users.array()[args.length - 3].id,
                debaters: debaters,
                speech: ""
            }
            console.log(debatersObj)

            client.rounds.set(guild.id + args[args.length - 1], debateConfig)
            const quoteSend = new Discord.MessageEmbed()
                .setColor("#007fff")
                .setTitle(`Round Started: ${args[args.length - 1]}`)
                .addField(`Round Name`, args[args.length - 1])
                .addField(`Event`, args[args.length - 2])
                .addField(`Judge`, message.mentions.users.array()[args.length - 3])
                .addField(`Debaters (In the order of AFF NEG)`, debatersObj)

            message.channel.send({ embed: quoteSend })
        }
        catch (err) {
            message.reply('Error! Please check that the "Currently Debating" & "Currently Judging" roles have been created.')
        }
    }
}