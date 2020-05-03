function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

exports.run = function (client, message) {
    const Discord = require('discord.js');
    const config = client.config;
    var guild = message.guild;
    var select = getRandomIntInclusive(1, 3);
    const embed = new Discord.MessageEmbed()
        .setColor(select === 1 ? "#ccff00" : select === 2 ? "#0072bb" : select === 3 ? "#ff4f00" : "#ccff00")
        .setTitle("DB8Bot Help\n")
        .addField('Prefix', `\`${config.prefix}\``)
        .addField('Example:', `\`${config.prefix}ping\``)
        .addField('Commands:', `Do \`${config.prefix}commands\` to see a full list of commands.`)
        .addField(`Setup`, `${config.name} requires a **modlog text channel**, a **debatelog text channel** and a **Mute role called "Mute"**. For automatic setup please use \`${config.prefix}setup\`. Otherwise please create these roles and channels.`)
        .addField('Checklist:', `Please run the command \`${config.prefix}checklist\` to check if db8bot has all the required permissions to run.`)
        .addField(`Opt-outs`, `User the \`${config.prefix}optout\` to opt-out of any command including dm & userinfo.`)
        .addField('Github', `The repo for this bot can be found [here](https://github.com/AirFusion45/db8bot).`)
        .addField('Support Server:', `Come [here](https://discord.gg/rEQc7C7) to get help or just hang out.`)
        .addField('Bot Invite Link', `Use \`${config.prefix}invite\` for the bot's invite link, or click [here](https://discordapp.com/oauth2/authorize?client_id=689368779305779204&scope=bot&permissions=2146958847)`)
        .setFooter(`Made by ${config.ownerTag}`)
        .setTimestamp()

    message.channel.send({ embed: embed })
    client.logger.log('info', `help command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
}