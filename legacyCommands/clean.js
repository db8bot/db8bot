exports.run = function (client, message, args) {
    const superagent = require('superagent')
    const PNG = require('pngjs').PNG
    const Discord = require('discord.js')
    const config = process.env
    const stream = require('stream')
    const embed1 = new Discord.MessageEmbed()
        .setColor('#f0ffff')
        .setDescription('**Command: **' + `${config.PREFIX}clean`)
        .addField('**Usage:**', `${config.PREFIX}clean <image/HTML paste attachment>`)
        .addField('**Example:**', `${config.PREFIX}clean`)
        .addField('**Expected Result From Example:**', 'Will apply a white background to images, useful for pasting from Verbatimized text in Microsoft Word.')

    require('../modules/legacyTelemetry').telemetry(__filename, client, message)
    message.channel.messages.fetch({ limit: 1 }).then(chanmsg => {
        if (chanmsg.first().attachments.first() != undefined) {
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
                    message.channel.send({ files: [Buffer.concat(sendDataArr)] })
                })
            })
        } else if (args.length > 0) {
            if (args[0].trim().match(/https:\/\/(cdn|media).(discordapp|discord).(com|net)\/attachments/g)) {
                superagent.get(args[0]).pipe(
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
                        message.channel.send({ files: [Buffer.concat(sendDataArr)] })
                    })
                })
            }
        } else {
            // send help!
            message.channel.send({ embeds: [embed1] })
        }
    })
}
