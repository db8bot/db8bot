exports.run = function (client, message, args) {
    var guild = message.guild
    const Discord = require('discord.js')
    const config = process.env
    if (args.join(' ') !== '') {
        message.reply('Feedback received from Discord Chatbox! Thank you for your feedback!')
        message.delete()
        message.delete()
        client.users.cache.find(val1 => val1.id === config.OWNER).send(`New feedback from ${message.author.tag} from server: ${message.guild.name}. Message/Feedback: ${args.join(' ')}`)
    } else {
        const embed1 = new Discord.MessageEmbed()
            .setColor('#f0ffff')
            .setDescription('**Command: **' + `${config.PREFIX}feedback`)
            .addField('**Usage:**', `${config.PREFIX}feedback <your feedback>`)
            .addField('**Example:**', `${config.PREFIX}feedback Better hosting for db8 bot!`)
            .addField('**Expected Result From Example:**', 'DMs the owner of the bot with your feedback.')

        message.channel.send({ embeds: [embed1] })
        require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    }
}
