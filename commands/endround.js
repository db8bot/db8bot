exports.run = function (client, message, args) {
    var guild = message.guild;
    const Discord = require('discord.js');
    var roundInfo = client.rounds.get(guild.id + args[0]);
    var decision = "";
    var debatersID = [];
    var mentionableDebaters = "";
    for (var i = 1; i < args.length; i++) {
        decision += args[i]
    }
    debatersID=roundInfo.debaters.split(" ")
    for (var j=0; j<debatersID.length-1; j++) {
        mentionableDebaters+=`<@!${debatersID[j]}> `
    }
    message.reply("Round Ended! Results Below")
    const results = new Discord.MessageEmbed()
        .setTitle(`Round Ended - ${message.guild.name} ${roundInfo.name} Results`)
        .setColor("#007fff")
        .addField(`Event`, roundInfo.type)
        .addField(`Judge`, `<@!${roundInfo.judge}>`)
        .addField(`Debaters`, mentionableDebaters)
        .addField(`Decision`, decision)

    message.channel.send({embed: results})

    client.rounds.delete(guild.id+args[0])

}