exports.run = function (client, message, args) {
    client.logger.log('info', `speeches command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
    var allowedSpeeches = ["1AC", "CX1", "1NC", "CX2", "2AC", "CX3", "2NC", "CX4", "1NR", "1AR", "2NR", "2AR", "AC", "CX1", "NC", "CX2", "1AR", "NR", "2AR", "Constructive A", "Constructive B", "Crossfire 1", "Rebuttle A", "Rebuttle B", "Crossfire 2", "Summary A", "Summary B", "Grand crossfire", "Final Focus A", "Final Focus B"]
    message.channel.send(`**Available Speeches:** ${allowedSpeeches.join(', ')}`)
}