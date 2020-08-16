exports.run = function (client, message) {
    var guild = message.guild;
    if (!message.guild.members.cache.get(message.author.id).hasPermission('MANAGE_GUILD', { checkAdmin: true, checkOwner: true })) return message.reply('Insufficant Permissions').catch(console.error)
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } client.logger.log('info', `setup command used by ${message.author.username} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
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
        })

        message.channel.send(`Creating debatelog channel...`).then(msg => {
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
        })

        message.channel.send(`Creating modlog channel...`).then(msg => {
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
        })

        message.channel.send(`:white_check_mark: Successfully created: Mute role, debatelog, modlog`)

    } catch (err) {
        message.channel.send(`ERROR! Please make sure I have administrator permissions!`).catch(err => console.error(err))
    }
}