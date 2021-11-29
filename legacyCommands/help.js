const Discord = require('discord.js')
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

exports.run = function (client, message, args) {
    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    const config = client.config
    var select = getRandomIntInclusive(1, 3)
    const embed = new Discord.MessageEmbed()
        .setColor(select === 1 ? '#ccff00' : select === 2 ? '#0072bb' : select === 3 ? '#ff4f00' : '#ccff00')
        .setTitle('DB8Bot Help\n')
        .setDescription(`THE BOT HAS MIGRATED TO SLASH COMMANDS. LEGACY COMMANDS THAT USE THE ${config.PREFIX} WILL BE FADED OUT SOON.`)
        .addField('List of slash-command only commands', 'lockdown, mute & unmute, purge, startround, setspeech, endround, roundstatus')
        .addField('Example:', '`/ping`')
        .addField('Commands:', 'Do `/commands` to see a full list of commands.')
        .addField('Setup', 'It is recommended to have a **modlog text channel**, a **debatelog text channel** and a **Mute role called "Mute"**. Note the `mute` command will not work unless you have a Mute role.')
        // .addField('Checklist:', `Please run the command \`/checklist\` to check if db8bot has all the required permissions to run.`)
        .addField('Privacy', 'For information about the data we collect please visit [here](https://github.com/AirFusion45/db8bot#privacy)')
        .addField('Debate Function Help', 'For detailed help on how to use the debate functions, use the /debatehelp command.')
        .addField('Github', 'The repo for this bot can be found [here](https://github.com/AirFusion45/db8bot).')
        .addField('Bot Status', 'The bot has a status page [here](https://airfusion.statuspage.io/). Please check this page first if a function isn\'t working. We might already be patching it!')
        .addField('Support Server:', 'Come [here](https://discord.gg/rEQc7C7) to get help or just hang out.')
        .addField('Bot Invite Link', `Use \`/invite\` for the bot's invite link, or click [here](${config.INVLINK})`)
        .setFooter(`Made by ${config.OWNERTAG}`)
        .setTimestamp()

    message.channel.send({ embeds: [embed] })
}