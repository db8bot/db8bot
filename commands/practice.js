exports.run = function (client, message, args) {
    const currentlyDebating = message.guild.roles.cache.find(role => role.name === "Currently Practicing");
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
    
}