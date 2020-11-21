
exports.run = function (client, message, args) {
    if (message.guild.id != "685646226942984206" && message.guild.id != "688603800549851298") return;
    else {
        message.reply('wHy r u rEaDINg bEn mOSHe')
        message.channel.send({ files: ["./assets/benmoshe.png"] })
    }
}