exports.run = function (client, message, args) {
    var guild = message.guild;
    const config = client.config;
    const Discord = require('discord.js');
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } const currentlyDebating = message.guild.roles.cache.find(role => role.name === "Currently Debating");
    const currentlyJudging = message.guild.roles.cache.find(role => role.name === "Currently Judging")
    const help = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}endround`)
        .addField("**Usage:**", `${config.prefix}endround <Round Name> <Decision: Spaces supported>`)
        .addField("**Example:**", `${config.prefix}endround AF-v-ND aff`)
        .addField("**Expected Result From Example:**", "Bot ends round (Note: Round data will be deleted from database) and outputs round info.")
    if (args.join(' ') === "" || args[0] === '' || args[1] === '' || args[2] === '') {
        message.channel.send({ embed: help })
        return;
    } else {
        var roundInfo = client.rounds.get(guild.id + args[0]);
        if (roundInfo === undefined) {
            message.channel.send({ embed: help })
            return;
        }
        var decision = "";
        var debatersID = [];
        var mentionableDebaters = "";
        for (var i = 1; i < args.length; i++) {
            decision += args[i]
        }
        if (decision === "") {
            message.channel.send({ embed: help })
            return;
        }
        debatersID = roundInfo.debaters.split(" ")
        for (var j = 0; j < debatersID.length - 1; j++) {
            mentionableDebaters += `<@!${debatersID[j]}> `
            guild.member(debatersID[j]).roles.remove(currentlyDebating)
        }
        guild.member(roundInfo.judge).roles.remove(currentlyJudging)
        message.reply("Round Ended! Results Below")
        const results = new Discord.MessageEmbed()
            .setTitle(`Round Ended - ${message.guild.name} ${roundInfo.name} Results`)
            .setColor("#007fff")
            .addField(`Event`, roundInfo.type)
            .addField(`Judge`, `<@!${roundInfo.judge}>`)
            .addField(`Debaters`, mentionableDebaters)
            .addField(`Decision`, decision)
            .setFooter(config.name)
            .setTimestamp()

        message.channel.send({ embed: results })
        guild.channels.cache.find(val => val.name === "debatelog").send({ embed: results }).catch(err => console.error(err))
        client.rounds.delete(guild.id + args[0])
        client.logger.log('info', `endround command used by ${message.author.username} ID: ${message.author.id} Time: ${Date()} Guild: ${guild}`)
    }
}