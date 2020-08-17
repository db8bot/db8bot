exports.run = function (client, message, args) {
    const superagent = require('superagent');
    const PNG = require("pngjs").PNG;
    const fs = require('fs')
    const Discord = require('discord.js');
    var guild = message.guild;
    const config = client.config;
    const embed1 = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}clean`)
        .addField("**Usage:**", `${config.prefix}clean <image/HTML paste attachment> OR ${config.prefix}clean`)
        .addField("**Example:**", `${config.prefix}clean`)
        .addField("**Expected Result From Example:**", "Will apply a white background to images, useful for pasting from Verbatimized text in Microsoft Word.")

    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    client.logger.log('info', `clean command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
    message.channel.messages.fetch({ limit: 1 }).then(chanmsg => {
        if (chanmsg.last().content === `${client.config.prefix}clean` && chanmsg.last().attachments.first() === undefined) { // no image in current msg
            
            message.channel.messages.fetch({ limit: 2 }).then(chanmsg2 => { // check last message

                if (chanmsg2.last().attachments.first() === undefined) {
                    message.channel.send({ embed: embed1 })
                } else {

                    // message.channel.send(chanmsg2.last().attachments.first().url)

                    var fileName = "./imgCleanTempFiles/" + getRndInteger(999, 999999).toString() + chanmsg.last().id + "x" + ".png" //${getRndInteger(999,999999)}- ${chanmsg.last().id}
                    fileName = fileName.toString()

                    superagent.get(chanmsg2.last().attachments.first().url).pipe(
                        new PNG({
                            colorType: 2,
                            bgColor: {
                                red: 255,
                                green: 255,
                                blue: 255,
                            },
                        })
                    ).on('parsed', function () {
                        this.pack().pipe(fs.createWriteStream(fileName))
                        setTimeout(() => {
                            message.channel.send({ files: [fileName] })
                        }, 500);
                    })
                    setTimeout(() => {
                        fs.unlink(fileName, (err) => {
                            if (err) console.log(err)
                            console.log(`${fileName} was deleted.`)
                        })
                    }, 1200);
                }
            })
        } else if (chanmsg.first().attachments.first() != undefined) {
            // message.channel.send(chanmsg.first().attachments.first().url)

            var fileName = "./imgCleanTempFiles/" + getRndInteger(999, 999999).toString() + chanmsg.last().id + "x" + ".png" //${getRndInteger(999,999999)}- ${chanmsg.last().id}
            fileName = fileName.toString()

            superagent.get(chanmsg.first().attachments.first().url).pipe(
                new PNG({
                    colorType: 2,
                    bgColor: {
                        red: 255,
                        green: 255,
                        blue: 255,
                    },
                })
            ).on('parsed', function () {
                this.pack().pipe(fs.createWriteStream(fileName))
                setTimeout(() => {
                    message.channel.send({ files: [fileName] })
                }, 500);
            })
            setTimeout(() => {
                fs.unlink(fileName, (err) => {
                    if (err) console.log(err)
                    console.log(`${fileName} was deleted.`)
                })
            }, 1200);
        } else if (args[0].includes("https://cdn.discordapp.com/attachments")) {
            var fileName = "./imgCleanTempFiles/" + getRndInteger(999, 999999).toString() + chanmsg.last().id + "x" + ".png" //${getRndInteger(999,999999)}- ${chanmsg.last().id}
            fileName = fileName.toString()

            superagent.get(args[0]).pipe(
                new PNG({
                    colorType: 2,
                    bgColor: {
                        red: 255,
                        green: 255,
                        blue: 255,
                    },
                })
            ).on('parsed', function () {
                this.pack().pipe(fs.createWriteStream(fileName))
                setTimeout(() => {
                    message.channel.send({ files: [fileName] })
                }, 500);
            })
            setTimeout(() => {
                fs.unlink(fileName, (err) => {
                    if (err) console.log(err)
                    console.log(`${fileName} was deleted.`)
                })
            }, 1200);
        }
        else {
            // send help!
            message.channel.send({ embed: embed1 })
        }
    })
}