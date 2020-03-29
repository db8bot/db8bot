const ipInfo = require("ipinfo");
exports.run = function (client, message, args, args2, cmd) {
    const config = client.config;
    const Discord = require('discord.js');
    var guild = message.guild;
    if (message.author.id === config.owner) {

        let user = message.author;
        ipInfo((err, cLoc) => {
            const embed = new Discord.MessageEmbed()
                .setTitle("PowerBot's Host's IP Information - PowerBot Does NOT Log IP Addresses")
                .setColor("36393E")
                .setTimestamp()
                .addField('IP', cLoc.ip)
                .addField('Host', cLoc.hostname)
                .addField('City', cLoc.city)
                .addField('Region', cLoc.region)
                .addField('Country', cLoc.country)
                .addField('Location Cords', cLoc.loc)
                .addField('Postal/Zip Code', cLoc.postal)
                .addField('ISP/Organization', cLoc.org)
            user.send({ embed: embed })

        })
    }

}