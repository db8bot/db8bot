exports.run = function (client, message, args, args2, cmd) {
    // console.log(client.optINOUT.get(message.author.id).value)
    try {
        let cleanzz = client.optINOUT.get(message.author.id).value.join(", ")
        if (cleanzz === "") {
            message.reply("You have not opted out of any services")
        } else {
            message.reply("Services you have opted out of: " + cleanzz)
        }
    } catch (err) {
        message.reply("You have not opted out of any service.")
    }
    // console.log(cleanzz)
}