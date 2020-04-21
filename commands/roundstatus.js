exports.run = function (client, message, args) {
    var guild = message.guild;
    var serverRounds = [];
    var currentInteration = "";
    const Discord = require('discord.js');
    var debatersID = [];
    var mentionableDebaters = "";
    const roundstats = new Discord.MessageEmbed()
        .setTitle(`Current Debates in ${guild.name}`)
        .setColor("#007fff")

    var keys = client.rounds.indexes;
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(guild.id) != -1) {
            serverRounds[i] = keys[i];
        }
    }
    console.log("SERVER ROUNDS  :  " + serverRounds)
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
    message.channel.send({ embed: roundstats })
    client.logger.log('info', `roundstatus command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
}