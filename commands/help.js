function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

exports.run = function (client, message) {
    const Discord = require('discord.js');
    const config = client.config;
    var select = getRandomIntInclusive(1, 3);
    const embed = new Discord.MessageEmbed()
        .setColor(select === 1 ? "#ccff00" : select === 2 ? "#0072bb" : select === 3 ? "#ff4f00" : "#ccff00")
        .setTitle("DB8Bot Help\n")
        .addField('Prefix', `\`${config.prefix}\``)
        .addField('Example:', `\`${config.prefix}ping\``)
        .addField('Commands:', `Do \`${config.prefix}commands\` to see a full list of commands.`)
        .addField(`Setup`, `It is recommended to have a **modlog text channel**, a **debatelog text channel** and a **Mute role called "Mute"**. Note the \`mute\` command will not work unless you have a Mute role.`)
        // .addField('Checklist:', `Please run the command \`${config.prefix}checklist\` to check if db8bot has all the required permissions to run.`)
        .addField(`Opt-outs`, `User the \`${config.prefix}optout\` to opt-out of any command including dm & userinfo.`)
        .addField(`Privacy`, `For information about the data we collect please visit [here](https://github.com/AirFusion45/db8bot#privacy)`)
        .addField(`Debate Function Help`, `For detailed help on how to use the debate functions, use the ${config.prefix}debatehelp command.`)
        .addField('Github', `The repo for this bot can be found [here](https://github.com/AirFusion45/db8bot).`)
        .addField(`Bot Status`, `The bot has a status page [here](https://airfusion.statuspage.io/). Please check this page first if a function isn't working. We might already be patching it!`)
        .addField('Support Server:', `Come [here](https://discord.gg/rEQc7C7) to get help or just hang out.`)
        .addField('Bot Invite Link', `Use \`${config.prefix}invite\` for the bot's invite link, or click [here](https://discordapp.com/oauth2/authorize?client_id=689368779305779204&scope=bot&permissions=2146958847)`)
        .setFooter(`Made by ${config.ownerTag}`)
        .setTimestamp()

    message.channel.send({ embeds: [embed] })
    client.logger.log('info', `help command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
}