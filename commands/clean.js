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
                .setDescription('link to the image (ex: cdn.discordapp.com)')
                .setRequired(false)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const args = interaction.options.getString('link')
        interaction.channel.messages.fetch({ limit: 1 }).then(chanmsg => {
            if (chanmsg.last().content.trim().match(/https:\/\/(cdn|media).(discordapp|discord).(com|net)\/attachments/g) && chanmsg.last().attachments.first() === undefined) { // no image in current msg, check for url pasted img in last msg
                var imgURL = chanmsg.last().content.trim().match(/https:\/\/(cdn|media).(discordapp|discord).(com|net)\/attachments\/[0-9]{0,18}\/[0-9]{0,18}\/[@"^[\w\-. ]+.(png|jpeg|jpg|webp|gif)/gmi)[0]
                superagent.get(imgURL).pipe(
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
            } else if (args != null && (args.trim().match(/https:\/\/(cdn|media).(discordapp|discord).(com|net)\/attachments/g))) {
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
            } else {
                interaction.reply('Please specify a link or make sure the message above the command message is an image')
            }
        })
    }
}
