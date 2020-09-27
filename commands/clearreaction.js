exports.run = function (client, message, args) {

    if (message.guild.id != "685646226942984206") return;
    else {
        message.channel.messages.fetch({ limit: args.join(' ') }).then(chanmsg => {
            let lm = chanmsg.array()
            // console.log(lm.content)
            // for (i = 0; i < chanmsg.length; i++) {
            //     chanmsg[i].reactions.removeAll();
            // }
            for (i = 0; i < lm.length; i++) {
                lm[i].reactions.removeAll();
            }

        })

    }
}