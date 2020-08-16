exports.run = function (client, message, args) {
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } client.logger.log('info', `speeches command used by ${message.author.username} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
    var allowedSpeeches = ["1AC", "CX1", "1NC", "CX2", "2AC", "CX3", "2NC", "CX4", "1NR", "1AR", "2NR", "2AR", "AC", "CX1", "NC", "CX2", "1AR", "NR", "2AR", "Constructive A", "Constructive B", "Crossfire 1", "Rebuttle A", "Rebuttle B", "Crossfire 2", "Summary A", "Summary B", "Grand crossfire", "Final Focus A", "Final Focus B"]
    message.channel.send(`**Available Speeches:** ${allowedSpeeches.join(', ')}`)
}