exports.run = function (client, message, args) {
    const Discord = require('discord.js');
    const config = client.config;
    const embed1 = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}embed`)
        .addField("**Usage:**", `${config.prefix}embed <message to embed>`)
        .addField("**Example:**", `${config.prefix}embed hello`)
        .addField("**Expected Result From Example:**", "Bot will send a embeded message to channel containing your message.")
    if (args.join(' ') === "") return message.channel.send({ embeds: [embed1] })
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } const embed = new Discord.MessageEmbed()
        .setColor("#3f00ff")
        .setAuthor("Author: " + message.author.username + "\n")
        .setFooter("ID: " + message.author.id)
        .addField("Message:", args.join(' '))
    message.channel.send({ embeds: [embed] })
    client.logger.log('info', `embed command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
}