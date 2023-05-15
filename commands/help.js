const Discord = require('discord.js')
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays Bot Help Page'),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        var select = getRandomIntInclusive(1, 3)
        const embed = new Discord.EmbedBuilder()
            .setColor(select === 1 ? '#ccff00' : select === 2 ? '#0072bb' : select === 3 ? '#ff4f00' : '#ccff00')
            .setTitle('db8bot Help\n')
            .addFields(
                { name: 'Example:', value: '`/ping`' },
                { name: 'Commands:', value: 'Do `/commands` to see a full list of commands.' },
                { name: 'Setup', value: 'It is recommended to have a **debatelog text channel** to allow the bot to log debate rounds. ' },
                { name: 'Privacy', value: 'For information about the data we collect please visit [here](https://github.com/db8bot/db8bot#privacy)' },
                { name: 'Journal Article Function Help', value: 'For detailed help on how to use the journal related commands (ex: get), use the `/journalhelp` command.' },
                { name: 'Debate Function Help', value: 'For detailed help on how to use the debate functions, use the `/debatehelp` command.' },
                { name: 'GitHub', value: 'The repo for this bot can be found [here](https://github.com/db8bot/db8bot).' },
                // { name: 'Bot Status', value: 'The bot has a status page [here](https://airfusion.statuspage.io/). Please check this page first if a function isn\'t working. We might already be patching it!' },
                { name: 'Support Server:', value: 'Come [here](https://discord.gg/rEQc7C7) to get help or just hang out.' },
                { name: 'Bot Invite Link', value: `Use \`/invite\` for the bot's invite link, or click [here](${process.env.INVLINK})` },
                { name: 'Feedback:', value: 'Do `/feedback` to send feedback to the bot developer!' }
            )
            .setFooter({ text: `Made by ${process.env.OWNERTAG}` })
            .setTimestamp()

        interaction.reply({ embeds: [embed] })
    }
}
