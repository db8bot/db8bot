exports.run = function (client, message) {
    const Discord = require('discord.js');
    const config = client.config;
    var guild = message.guild;
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } const embed = new Discord.MessageEmbed()
        .setTitle("If a role is true, means you have the role setup correctly, if it is false, then there is something wrong with the role.")
        .setColor('#ff0000')
        .setFooter(config.name + " CheckList")

    embed100.addField("db8bot Manage Server Permissions (Required for the bot to function fully): ", message.guild.member(config.botid).hasPermission("MANAGE_SERVER"))
    // embed100.addField("db8bot ADMINISTRATOR Permissions: (Note: Administrator permissions are not required but recommended. The bot will still function without administrator.)", message.guild.member(config.botid).hasPermission("ADMINISTRATOR"))
    let muteRole = message.guild.roles.cache.find(role => role.name === "Mute");
    let mute = true;
    if (!muteRole) mute = false;
    embed100.addField(`db8bot Mute Role (role required for mute command to function, use ${config.prefix}setup for auto setup): `, mute)
    message.channel.send({ embeds: [embed] })
    client.logger.log('info', `checklist command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
};