exports.run = function (client, message) {
    var guild = message.guild;
    client.logger.log('info', `setup command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
    try {
        message.channel.send(`Creating mute role...`).then(msg => {
            guild.roles.create({
                data: {
                    name: `Mute`,
                    color: 'BLACK',
                    position: 1,
                    hoist: false,
                    mentionable: false,
                    permissions: 0
                }, reason: "Mute role"
            })
            msg.edit(':white_check_mark: Mute role created!')

            msg.edit(`Creating debatelog channel...`)
            if (guild.channels.cache.find(val => val.name === "debatelog") === undefined) {
                guild.channels.create('debatelog', {
                    type: 'text',
                    reason: 'debatelog channel creation.',
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: ['SEND_MESSAGES'],
                        }
                    ]
                })
            }
            msg.edit(`:white_check_mark: Debate log channel created!`)

            msg.edit(`Creating modlog channel...`)
            if (guild.channels.cache.find(val => val.name === "modlog") === undefined) {
                guild.channels.create('modlog', {
                    type: 'text',
                    reason: 'modlog channel creation.',
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: ['SEND_MESSAGES'],
                        }
                    ]
                })
            }
            msg.edit(`:white_check_mark: Modlog channel created!`)

            msg.edit(`:white_check_mark: Successfully created: Mute role, debatelog, modlog`)
        })
    } catch (err) {
        message.channel.send(`ERROR! Please make sure I have administrator permissions!`).catch(err => console.error(err))
    }
}