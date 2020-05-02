exports.run = function (client, message, args, args2, cmd) {
    console.log(client.optINOUT.get(message.author.id).value)
    let cleanzz = client.optINOUT.get(message.author.id).value.join(", ")
    message.reply("Services you have opted out of: " + cleanzz)
}