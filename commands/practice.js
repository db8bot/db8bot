exports.run = function (client, message, args) {
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } const currentlyDebating = message.guild.roles.cache.find(role => role.name === "Currently Practicing");
    // const currentlyJudging = message.guild.roles.cache.find(role => role.name === "Currently Judging")
    var guild = message.guild;
    // console.log(args)
    // console.log(args[args.length-1])
    // console.log(args[args.length-2])
    // message.channel.send(args[args.length-1])
    // message.channel.send(args[args.length-2])

    for (var i = 0; i < args.length; i++) {
        guild.member(message.mentions.users.array()[i]).roles.add(currentlyDebating)
    }
    // guild.member(message.mentions.users.array()[args.length-3]).roles.add(currentlyJudging)
    client.logger.log('info', `practice command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
}