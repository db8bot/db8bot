exports.run = function (client, message) {
    if (message.guild.id != "685646226942984206") return;
    else {
        const member = message.guild.member(message.mentions.users.first());
        const role = message.guild.roles.cache.find(role => role.name === "testinglol");
        member.roles.remove(role);
    }
    // .then((GuildMember) => {
    //     message.channel.send(`:white_check_mark: Role ${role} has been added to ${member} `)
    // })
    // .catch((err) => {
    //     console.log(err)
    //     message.channel.send(`:x: Was not able to add Role ${role} to ${member} `)
    //     message.channel.send("**Error:** " + err.message + " **Code:** " + err.code)
    //     return;
    // });

    // eval
    // message.channel.send(Creating mute role...).then(msg => {
    //     message.guild.roles.create({
    //         data: {
    //             name: testinglol,
    //             color: 'BLACK',
    //             position: 30,
    //             hoist: false,
    //             mentionable: true,
    //             permissions: 8
    //         }, reason: "test dont kick me pls"
    //     })
    //     msg.edit(':white_check_mark: Mute role created!')
    // })
}