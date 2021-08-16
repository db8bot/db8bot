exports.run = function (client, message, args) {
    var guild = message.guild;
    const Discord = require('discord.js');
    const config = client.config;
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } if (args.join(' ') !== "") {
        message.reply("Feedback received from Discord Chatbox! Thank you for your feedback!")
        message.delete()
        message.delete()
        client.users.cache.find(val1 => val1.id === config.owner).send(`New feedback from ${message.author.tag} from server: ${message.guild.name}. Message/Feedback: ${args.join(' ')}`)
    } else {
        const embed1 = new Discord.MessageEmbed()
            .setColor("#f0ffff")
            .setDescription("**Command: **" + `${config.prefix}feedback`)
            .addField("**Usage:**", `${config.prefix}feedback <your feedback>`)
            .addField("**Example:**", `${config.prefix}feedback Better hosting for db8 bot!`)
            .addField("**Expected Result From Example:**", "DMs the owner of the bot with your feedback.")

        message.channel.send({ embeds: [embed1] })
        client.logger.log('info', `feedback command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
    }
}