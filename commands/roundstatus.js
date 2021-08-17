exports.run = function (client, message, args) {
    var guild = message.guild;
    var serverRounds = [];
    var serverRoundsNotClean = [];
    var currentInteration = "";
    const Discord = require('discord.js');
    var debatersID = [];
    var mentionableDebaters = "";
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } const roundstats = new Discord.MessageEmbed()
        .setTitle(`Current Debates in ${guild.name}`)
        .setColor("#007fff")

    var keys = client.rounds.indexes;
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(guild.id) != -1) {
            serverRoundsNotClean[i] = keys[i];
        }
    }
    console.log("SERVER ROUNDS  :  " + serverRoundsNotClean)
    for (var i = 0; i < serverRoundsNotClean.length; i++) {
        if (serverRoundsNotClean[i] != undefined) {
            serverRounds.push(serverRoundsNotClean[i])
        }
    }
    for (var i = 0; i < serverRounds.length; i++) {
        currentInteration = client.rounds.get(serverRounds[i]);
        console.log(currentInteration)
        debatersID = currentInteration.debaters.split(" ")
        for (var j = 0; j < debatersID.length - 1; j++) {
            mentionableDebaters += `<@!${debatersID[j]}> `
        }
        roundstats.addField(`Debate ${i + 1}`, `Name: ${currentInteration.name} | Round Type: ${currentInteration.type} | Judge: <@!${currentInteration.judge}> | Debaters: ${mentionableDebaters} | Current Speech: ${currentInteration.speech === "" ? "No speech started yet" : currentInteration.speech}`)
        mentionableDebaters = "";
    }
    message.channel.send({ embeds: [roundstats] })
    client.logger.log('info', `roundstatus command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
}