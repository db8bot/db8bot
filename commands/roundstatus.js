exports.run = function (client, message, args) {
    var guild = message.guild;
    console.log(args[0])
    console.log(client.rounds.get(guild.id+args[0]));
}