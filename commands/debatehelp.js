function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}
exports.run = function (client, message) {

    const Discord = require('discord.js');
    var select = getRandomIntInclusive(1, 3);
    const embed = new Discord.MessageEmbed()
        .setColor(select === 1 ? "#ccff00" : select === 2 ? "#0072bb" : select === 3 ? "#ff4f00" : "#ccff00")
        .setTitle("DB8Bot Debate Function Help\n")
        .addField(`Start a round`, `Use the startround command`)
        .addField(`Move a round forward`, `Set the current speech using the setspeech command. For available use the speeches command`)
        .addField(`Check a round's status`, `Use the roundstatus command. Rounds are identified by the name assigned at the start of the round.`)
        .addField(`Flip a coin for PF`, `Use the flip command`)
    message.channel.send({ embeds: [embed] })
    client.logger.log('info', `debatehelp command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
}