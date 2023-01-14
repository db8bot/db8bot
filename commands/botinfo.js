const Discord = require('discord.js')
const fs = require('fs')
const dir = './commands'
let commandsLength = 0
fs.readdir(dir, (_err, files) => {
    commandsLength = files.length
})
const pkg = require('../package.json')
const os = require('os')

function timeCon(time) {
    time = time * 1000
    let days = 0
    let hours = 0
    let minutes = 0
    let seconds = 0
    days = Math.floor(time / 86400000)
    time -= days * 86400000
    hours = Math.floor(time / 3600000)
    time -= hours * 3600000
    minutes = Math.floor(time / 60000)
    time -= minutes * 60000
    seconds = Math.floor(time / 1000)
    time -= seconds * 1000
    days = days > 9 ? days : '' + days
    hours = hours > 9 ? hours : '' + hours
    minutes = minutes > 9 ? minutes : '' + minutes
    seconds = seconds > 9 ? seconds : '' + seconds
    return (parseInt(days) > 0 ? days + ' days ' : ' ') + (parseInt(hours) === 0 && parseInt(days) === 0 ? '' : hours + ' hours ') + minutes + ' minutes ' + seconds + ' seconds'
}

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Basic Information About db8bot')
        .addStringOption(option =>
            option.setName('flags')
                .addChoices({ name: 'nerdy', value: 'nerdy' })
                .setDescription('Optional flags for the botinfo command')
                .setRequired(false)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const args = interaction.options.getString('flags')

        let totalPeople = 0
        let botNumber = 0

        totalPeople = interaction.client.guilds.cache.map(person => person.memberCount).reduce(function (s, v) { return s + (v || 0) }, 0)
        // eslint-disable-next-line no-return-assign
        interaction.client.guilds.cache.map(botPerson => botNumber += botPerson.members.cache.filter(member => member.user.bot).size)
        const embed = new Discord.EmbedBuilder()
            .setColor('#222025')
            .setTitle(interaction.client.user.username + ' V: ' + pkg.version + ' ' + process.env.BUILD)
            .setDescription(interaction.client.user.username + ' has been awake for ' + timeCon(process.uptime()) + '.')
            .setTimestamp()
            .setThumbnail('https://cdn.discordapp.com/avatars/689368779305779204/c2a07a52298c2207e0f383f7d403ee30.webp?size=1024')
            .addFields(
                { name: ':construction_worker: Creator', value: process.env.OWNERTAG, inline: true },
                { name: '🏠 Guilds', value: '' + interaction.client.guilds.cache.size, inline: true },
                { name: '📄 Channels', value: '' + interaction.client.channels.cache.size, inline: true },
                {
                    name: '🤵 Total Users', value: '' + (totalPeople - botNumber), inline: true
                },
                { name: ':clipboard: # of registered Slash Commands', value: '' + commandsLength, inline: true },
                { name: ':gem: Shards', value: 'N/A', inline: true },
                { name: ':link: Invite', value: `[Click Here](${process.env.INVLINK})` },
                { name: '🐏 RAM Usage', value: `${((process.memoryUsage().rss / 1024) / 1024).toFixed(2)} MB / ${(((os.totalmem() / 1024) / 1024) / 1024).toFixed(2)} GB`, inline: true },
                { name: ':clock: System Uptime', value: timeCon(os.uptime()), inline: true },
                { name: '🏓 Ping', value: `${(interaction.client.ws.ping).toFixed(0)} ms`, inline: true },
                { name: ':bookmark_tabs: Library', value: `Discord JS v${Discord.version}`, inline: true },
                { name: ':computer: Node.js ', value: `${process.version}`, inline: true },
                { name: ':compass: Host Name', value: `${os.hostname}`, inline: true },
                { name: ':cd: Host OS/Arch', value: `${os.platform} ${os.release}/${os.arch()}`, inline: true },
                { name: ':fire: Load', value: `${os.loadavg().map(x => x.toFixed(4)).join(' | ')} / ${os.cpus().length} CPUs`, inline: true }
            )

        if (args === 'nerdy') {
            interaction.reply({ embeds: [embed] })
        } else {
            const embednotNerdy = new Discord.EmbedBuilder()
                .setColor('#5093d1')
                .setTitle(interaction.client.user.username + ' V: ' + pkg.version + ' ' + process.env.BUILD)
                .setDescription(interaction.client.user.username + ' has been awake for ' + timeCon(process.uptime()) + '.')
                .setTimestamp()
                .setThumbnail('https://cdn.discordapp.com/avatars/689368779305779204/c2a07a52298c2207e0f383f7d403ee30.webp?size=1024')
                .addFields({ name: ':construction_worker: Creator', value: process.env.OWNERTAG, inline: true },
                    { name: '🏠 Guilds', value: '' + interaction.client.guilds.cache.size, inline: true },
                    { name: '📄 Channels', value: '' + interaction.client.channels.cache.size, inline: true },
                    {
                        name: '🤵 Total Users', value: '' + (totalPeople - botNumber), inline: true
                    },
                    { name: ':clipboard: # of registered Slash Commands', value: '' + commandsLength, inline: true },
                    { name: ':gem: Shards', value: 'N/A', inline: true },
                    { name: ':link: Invite', value: `[Click Here](${process.env.INVLINK})` })
            interaction.reply({ embeds: [embednotNerdy] })
        }
    }
}
