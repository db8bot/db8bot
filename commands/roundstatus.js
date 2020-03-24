exports.run = function (client, message, args) {
    var guild = message.guild;
    var serverRounds = [];
    var currentInteration = "";
    const Discord = require('discord.js');
    var debatersID = [];
    var mentionableDebaters = "";
    // console.log(args[0])
    // console.log(client.rounds.get(guild.id+args[0]));
    const roundstats = new Discord.MessageEmbed()
        .setTitle(`Current Debates in ${guild.name}`)
        .setColor("#007fff")

    var keys = client.rounds.indexes;
    // console.log(keys)
    for (var i = 0; i<keys.length; i++) {
        if (keys[i].indexOf(guild.id)!=-1) {
            serverRounds[i]=keys[i];
        }
    }
    console.log("SERVER ROUNDS  :  "+serverRounds)
    for (var i = 0; i<serverRounds.length; i++) {
        // console.log(currentInteration)
        currentInteration = client.rounds.get(serverRounds[i]);
        console.log(currentInteration)
        debatersID=currentInteration.debaters.split(" ")
        // console.log(debatersID)
        for (var j=0; j<debatersID.length-1; j++) {
            mentionableDebaters+=`<@!${debatersID[j]}> `
        }
        // console.log(mentionableDebaters)
        roundstats.addField(`Debate ${i+1}`, `Name: ${currentInteration.name} | Round Type: ${currentInteration.type} | Judge: <@!${currentInteration.judge}> | Debaters: ${mentionableDebaters} | Current Speech: ${currentInteration.speech===""?"No speech started yet (Before 1AC)":currentInteration.speech}`)
        mentionableDebaters="";
    }
    message.channel.send({embed: roundstats})
 }