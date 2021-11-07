const { SlashCommandBuilder } = require('@discordjs/builders')
const superagent = require('superagent')
const PNG = require('pngjs').PNG
const stream = require('stream')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clean')
        .setDescription('add a white background to an image')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('link to the image (cdn.discordapp.com)')
                .setRequired(false)
        ),
    async execute(interaction) {
        interaction.client.logger.log('info', `clean command used by ${interaction.user.username} Time: ${Date()} Guild: ${interaction.guild.name}`)
        const args = interaction.options.getString('link')
        interaction.channel.messages.fetch({ limit: 1 }).then(chanmsg => {
            if (chanmsg.last().content === `${interaction.client.config.PREFIX}clean` && chanmsg.last().attachments.first() === undefined) { // no image in current msg
                interaction.channel.messages.fetch({ limit: 2 }).then(chanmsg2 => { // check last message
                    if (chanmsg2.last().attachments.first() === undefined) {
                        interaction.reply('help')
                    } else {
                        superagent.get(chanmsg2.last().attachments.first().url).pipe(
                            new PNG({
                                colorType: 2,
                                bgColor: {
                                    red: 255,
                                    green: 255,
                                    blue: 255
                                }
                            })
                        ).on('parsed', async function () {
                            var sendDataArr = []
                            const createWriteStream = () => {
                                return stream.Writable({
                                    write(chunk, enc, next) {
                                        sendDataArr.push(chunk)
                                        next()
                                    }
                                })
                            }
                            const writeStream = createWriteStream()
                            this.pack().pipe(writeStream)
                            writeStream.on('finish', () => {
                                interaction.reply({ files: [Buffer.concat(sendDataArr)] })
                            })
                        })
                    }
                })
            } else if (chanmsg.first().attachments.first() !== undefined) {
                superagent.get(chanmsg.first().attachments.first().url).pipe(
                    new PNG({
                        colorType: 2,
                        bgColor: {
                            red: 255,
                            green: 255,
                            blue: 255
                        }
                    })
                ).on('parsed', async function () {
                    var sendDataArr = []
                    const createWriteStream = () => {
                        return stream.Writable({
                            write(chunk, enc, next) {
                                sendDataArr.push(chunk)
                                next()
                            }
                        })
                    }
                    const writeStream = createWriteStream()
                    this.pack().pipe(writeStream)
                    writeStream.on('finish', () => {
                        interaction.reply({ files: [Buffer.concat(sendDataArr)] })
                    })
                })
            } else if (args.includes('https://cdn.discordapp.com/attachments') || args.includes('https://cdn.discord.com/attachments') || args.includes('https://media.discordapp.net/attachments')) {
                superagent.get(args).pipe(
                    new PNG({
                        colorType: 2,
                        bgColor: {
                            red: 255,
                            green: 255,
                            blue: 255
                        }
                    })
                ).on('parsed', async function () {
                    var sendDataArr = []
                    const createWriteStream = () => {
                        return stream.Writable({
                            write(chunk, enc, next) {
                                sendDataArr.push(chunk)
                                next()
                            }
                        })
                    }
                    const writeStream = createWriteStream()
                    this.pack().pipe(writeStream)
                    writeStream.on('finish', () => {
                        interaction.reply({ files: [Buffer.concat(sendDataArr)] })
                    })
                })
            }
        })
    }
}
