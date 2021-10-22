exports.run = function (client, message) {
  const Discord = require('discord.js');
  const scopeUpdateMsg = new Discord.MessageEmbed()
    .setColor('#ff0000')
    .setTitle('db8bot Needs to be Reauthorized! - One Time Action')
    .setDescription('You only need to click the authorization link ONCE. It is included in multiple places to make it easier to find. For questions, contact AirFusion#1706 on Discord')
    .addField('TL;DR', 'db8bot needs to reauthorized as soon as possible using [this link](https://discord.com/api/oauth2/authorize?client_id=689368779305779204&permissions=310647056497&scope=bot%20applications.commands) because Discord is enforcing slash commands in April 2022.')
    .addField('Why?', 'Discord will be enforcing bots to use Slash commands (instead of commands with a prefix) starting April 2022. In order for that to work, **bots invited after March 2021 need to be reauthorized using [this](https://discord.com/api/oauth2/authorize?client_id=689368779305779204&permissions=310647056497&scope=bot%20applications.commands) link.** See Discord\'s announcement [here](https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Access-Deprecation-for-Verified-Bots). db8bot will transition to slash commands in less than 2 months so we can fix bugs before the mandatory transition.')
    .addField('How?', 'Reauthorize db8bot using [this](https://discord.com/api/oauth2/authorize?client_id=689368779305779204&permissions=310647056497&scope=bot%20applications.commands) link. It needs to be done by members with the __**manage server**__ permission. You **do not need to kick db8bot.** Just click on the link and "re-add" the bot to your server.')
    .addField('What if I don\'t reauthorize?', 'db8bot will stop functioning in your server beginning April 2022. You can reauthorize anytime to restore functionality.')
    .addField('Stop this message', 'To stop receiving this message, ask a member with the `Manage Server` permission to execute `-stopnotice`.')

  message.channel.send({ embeds: [scopeUpdateMsg] })
}