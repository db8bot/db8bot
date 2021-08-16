exports.run = function (client, message, args, args2, cmd) {
    const Discord = require('discord.js');
    var guild = message.guild || { name: "DM" };
    let user = message.mentions.users.first()
    const config = client.config;
    const embed1 = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}dm`)
        .addField("**Usage:**", `${config.prefix}dm <@username> <Your message>`)
        .addField("**Example:**", `${config.prefix}dm @AirFusion hello`)
        .addField("**Expected Result From Example:**", "Mentioned user should get a DM from the bot with the correct message & message in chat should be deleted.")
    if (!user || args[1] === undefined) return message.channel.send({ embeds: [embed1] })
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    }
    if (client.optINOUT.get(user.id) != undefined) {
        if (client.optINOUT.get(user.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send(`The user you are mentioning has opted out of the service: ${__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js"))}.`)
    }
    if (user.bot === false) {
        const embed = new Discord.MessageEmbed()
            .setColor("#008000")
            .setTitle(`You Have a New Message from user ${message.author.username} from ${guild.name}`)
            .setDescription("ID: " + message.author.id)
            .setThumbnail(message.author.avatarURL)
            .setTimestamp()
            .addField("Message:", args.slice(1).join(' '))
            .setFooter("Reply by using the command -dm @<replyUser> <message>")
        user.send({ embeds: [embed] })
        message.delete()
        message.reply("Message sent!")
    } else {
        message.reply(`Failed to send message: You cannot DM a bot!`)
    }
    client.logger.log('info', `dm command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
}