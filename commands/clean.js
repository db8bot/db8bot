exports.run = function (client, message, args) {
    message.channel.messages.fetch({ limit: 1 }).then(messages => {
        let lastMessage = messages.first();
        if (!lastMessage.author.bot) {
            console.log(lastMessage.attachments) // mapped by id need to map search  https://anidiots.guide/understanding/collections
        }
    })
}