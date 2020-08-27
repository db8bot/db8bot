
exports.run = function (client, message, args) {
    if (message.guild.id != "685646226942984206") return;
    else {
        user = message.mentions.users.first()
        if (message.guild.member(user).bannable) {
            message.guild.ban(user)
        }
    }
}