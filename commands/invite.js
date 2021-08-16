exports.run = function (client, message, args) {

    const Discord = require('discord.js');
    const config = client.config;
    var guild = message.guild;
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } const embed = new Discord.MessageEmbed()
        .setColor("#00ffff")
        .setTimestamp()
        .setFooter("Invite Link for " + config.name)
        .addField(`Invite link:`, `[Here](${config.invLink}) | Thanks for inviting ${config.name}!`)

    message.channel.send({ embeds: [embed] })
    client.logger.log('info', `invite command used by ${message.author.username} Time: ${Date.now()} Guild: ${guild}`)
}