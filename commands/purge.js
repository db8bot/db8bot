exports.run = function (client, message, args, args2, cmd1) {
    const config = client.config;
    const Discord = require('discord.js');
    var guild = message.guild;
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } const embed1 = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}purge`)
        .addField("**Usage:**", `${config.prefix}purge <x messages>`)
        .addField("**Example:**", `${config.prefix}purge 1`)
        .addField("**Expected Result From Example:**", "1 message should be purged from current channel.")
    if (args.join(' ') == "") return message.channel.send({ embeds: [embed1] })
    if (message.guild.members.cache.get(message.author.id).permissions.has(Discord.Permissions.FLAGS.MANAGE_MESSAGES) || message.guild.members.cache.get(message.author.id).permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) || message.author.id === config.owner || message.author.id === "688926801824841783") {
        message.delete()
        message.channel.bulkDelete(parseInt(args.join(' ')) + 1).catch(err => message.reply("Bots can only purge messages that are less than 14 days old. This error could be caused by DiscordAPI Overload"))
    } else if ((message.channel.id === "696394786038480926" || message.channel.id === "690318815996805204" || message.channel.id === "685647088842833932") && message.guild.id === "685646226942984206") {
        message.delete()
        message.channel.bulkDelete(parseInt(args.join(' ')) + 1).catch(err => message.reply("Bots can only purge messages that are less than 14 days old. This error could be caused by DiscordAPI Overload"))
    }
    else {
        message.reply('Insufficant Permissions').catch(console.error)
    }
    client.logger.log('info', `purge command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
}