function timeCon(time) {
    time = time * 1000
    let days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0
    days = Math.floor(time / 86400000)
    time -= days * 86400000
    hours = Math.floor(time / 3600000)
    time -= hours * 3600000
    minutes = Math.floor(time / 60000)
    time -= minutes * 60000
    seconds = Math.floor(time / 1000)
    time -= seconds * 1000
    days = days > 9 ? days : "" + days
    hours = hours > 9 ? hours : "" + hours
    minutes = minutes > 9 ? minutes : "" + minutes
    seconds = seconds > 9 ? seconds : "" + seconds
    return (parseInt(days) > 0 ? days + " days " : " ") + (parseInt(hours) === 0 && parseInt(days) === 0 ? "" : hours + " hours ") + minutes + " minutes " + seconds + " seconds."
}

const fs = require('fs');
const dir = './commands';
let commandsLength = 0;
fs.readdir(dir, (err, files) => {
    commandsLength = files.length;
});

exports.run = function (client, message, args) {
    const Discord = require('discord.js');
    const config = client.config;
    const pkg = require("../package.json");
    const os = require("os")
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } var guild = message.guild;
    let totalPeople = 0;
    let botNumber = 0;
    // var brokenglass = client.emojis.cache.find(val => val.name === 'brokenGlass')
    // client.guilds.cache.map(person => totalPeople += person.memberCount)
    totalPeople = client.guilds.cache.map(person => person.memberCount).reduce(function (s, v) { return s + (v || 0); }, 0);
    client.guilds.cache.map(botPerson => botNumber += botPerson.members.cache.filter(member => member.user.bot).size)
    const embed = new Discord.MessageEmbed()
        .setColor('36393E')
        .setTitle(client.user.username + " V: " + pkg.version)
        .setDescription(client.user.username + ' has been awake for ' + timeCon(process.uptime()))
        .addField(`:construction_worker: Creator`, config.ownerTag, true)
        .addField('🏠 Guilds', "" + client.guilds.cache.size, true)
        .addField('📄 Channels', "" + client.channels.cache.size, true)
        .addField('🤵 Total Users', "" + (totalPeople - botNumber), true) //repl with -test cmd contents
        .addField(':arrow_left: Prefix', config.prefix, true)
        .addField(':clipboard: # of Commands - Some not accessable to users', "" + commandsLength, true)
        .addField(`:gem: Shards`, 'N/A')
        // .addField(`:heart: Upvote ${config.name}`, `[Discord Bot List (discordbots.org)](https://discordbots.org/bot/460610749283172353)\n[Discord Bot List](https://discordbotlist.com/bots/460610749283172353)\n[Bots on Discord](https://bots.ondiscord.xyz/bots/460610749283172353)\n[Bots for Discord](https://botsfordiscord.com/bots/460610749283172353)`, true) // check if this is working with the custom emoji
        // .addField(`:moneybag: Donate`, `[DonateBot](https://donatebot.io/checkout/430303752357019648)\n[Patreon](https://www.patreon.com/airfusion)`, true) //check if everything runs here.
        // .addField('💾 Last Commit', jsonBody[0].commit.message, true)
        .addField('🐏 RAM Usage', `${((process.memoryUsage().rss / 1024) / 1024).toFixed(2)} MB`, true)
        .addField(':clock: System Uptime', timeCon(os.uptime()), true)
        .addField('🏓 Ping', `${(client.ws.ping).toFixed(0)} ms`, true)
        .addField(`:control_knobs: Library`, `Discord JS v${Discord.version}`, true)
        .addField(`:computer: Node.js `, `${process.version}`, true)
        .addField(`:regional_indicator_h: :regional_indicator_o: :regional_indicator_s: :regional_indicator_t: Host Name`, `${os.hostname}`, true)
        .addField(`:white_check_mark: Host OS`, `${os.platform} ${os.release}`, true)

    if (args.join(' ') === "nerdy") {
        message.channel.send({ embeds: [embed] })
    }
    else {
        const embednotNerdy = new Discord.MessageEmbed()
            .setColor('36393E')
            .setTitle(client.user.username + " V: " + pkg.version)
            .setDescription('Awake for ' + timeCon(process.uptime()))
            .addField(':crown: Developer/Owner', config.ownerTag, true)
            .addField('🏠 Guilds', "" + client.guilds.cache.size, true)
            .addField('📄 Channels', "" + client.channels.cache.size, true)
            .addField('🤵 Total Users', "" + (totalPeople - botNumber), true)
            .addField(':arrow_left: Prefix', config.prefix, true)
            .addField(':clipboard: # of Commands - Some not accessable to users', "" + commandsLength, true)
            .addField(`:gem: Shards`, 'N/A', true)
        // .addField(`:heart: Upvote ${config.name}`, `[Discord Bot List (discordbots.org)](https://discordbots.org/bot/460610749283172353)\n[Discord Bot List](https://discordbotlist.com/bots/460610749283172353)\n[Bots on Discord](https://bots.ondiscord.xyz/bots/460610749283172353)\n[Bots for Discord](https://botsfordiscord.com/bots/460610749283172353)`, true) // check if this is working with the custom emoji
        // .addField(`:moneybag: Donate`, `[DonateBot](https://donatebot.io/checkout/430303752357019648)\n[Patreon](https://www.patreon.com/airfusion)`, true) //check if everything runs here.
        message.channel.send({ embeds: [embednotNerdy] })
    }
    client.logger.log('info', `botinfo command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
};