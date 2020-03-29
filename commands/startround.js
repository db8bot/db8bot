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
    // console.log(args)
    // console.log(args[args.length-1])
    // console.log(args[args.length-2])
    // message.channel.send(args[args.length-1])
    // message.channel.send(args[args.length-2])
    if (args.join(" ") === "" || (args[args.length - 1].indexOf('<@!') != -1) || (args[args.length - 2].indexOf('<@!')) != -1 || args.length < 5) {
        // message.reply(`Round start failed :(`)
        const help = new Discord.MessageEmbed()
            .setColor("#f0ffff")
            .setDescription("**Command: **" + `${config.prefix}startround`)
            .addField("**Usage:**", `${config.prefix}startround <Mentioned debaters in the order of AFF to NEG seperated by a space per debater> <Mentioned judge: Only supports 1 judge> <Type of event: policy/cx/pol, ld/douglas, pf/pufo/forum> <Round name: No spaces allowed in the name!>`)
            .addField("**Example:**", `${config.prefix}startround @AirFusion @Bob @Nick @David @JudgeMary policy AF-v-ND`)
            .addField("**Expected Result From Example:**", "Bot returns round started message with round information.")
        message.channel.send({embed: help})
        return;
    } else {
        for (var i = 0; i < args.length - 3; i++) {
            guild.member(message.mentions.users.array()[i]).roles.add(currentlyDebating)
            debaters += message.mentions.users.array()[i] + " "
            debatersObj += `${guild.member(message.mentions.users.array()[i])} `
        }
        guild.member(message.mentions.users.array()[args.length - 3]).roles.add(currentlyJudging)

        debateConfig = {
            type: args[args.length - 2],
            name: args[args.length - 1],
            judge: message.mentions.users.array()[args.length - 3].id,
            debaters: debaters,
            speech: ""
        }

        // console.log(debateConfig)
        // message.channel.send(debateConfig)
        // console.log(guild.id + args[args.length - 1])
        console.log(debatersObj)

        client.rounds.set(guild.id + args[args.length - 1], debateConfig)
        // console.log(client.rounds.getProp(guild.id+args[args.length-1], debateConfig.debaters))
        // message.channel.send("SET!")
        const quoteSend = new Discord.MessageEmbed()
            .setColor("#007fff")
            .setTitle(`Round Started: ${args[args.length - 1]}`)
            .addField(`Round Name`, args[args.length - 1])
            .addField(`Event`, args[args.length - 2])
            .addField(`Judge`, message.mentions.users.array()[args.length - 3])
            .addField(`Debaters (In the order of AFF NEG)`, debatersObj)

        message.channel.send({ embed: quoteSend })
    }
}