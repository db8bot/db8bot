exports.run = function (client, message, args) {
    var guild = message.guild;
    const Discord = require('discord.js');
    const config = client.config;

    if (args.join(' ') !== "") {
        message.reply("Feedback received from Discord Chatbox! Thank you for your feedback!")
        message.delete()
        message.delete()
        // message.delete()
        client.users.cache.find(val1 => val1.id === config.owner).send(`New feedback from ${message.author.tag} from server: ${message.guild.name}. Message/Feedback: ${args.join(' ')}`)
    }
}