const { SlashCommandBuilder } = require('discord.js')
const superagent = require('superagent')
const PNG = require('pngjs').PNG
const stream = require('stream')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleanimage')
        .setDescription('Add a white background to an image; Helpful when pasting text from Verbatim')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('link to an image on Discord (REQUIRES cdn.discordapp.com link)')
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('image to add a white background to')
                .setRequired(false)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const args = interaction.options.getString('link') || (interaction.options.getAttachment('image') !== null ? interaction.options.getAttachment('image').url : null)
        var imgURL
        if (args != null && (args.trim().match(/https:\/\/(cdn|media).(discordapp|discord).(com|net)\/.*.(png|jpeg|jpg|webp|gif)/g))) {
            imgURL = args.trim().match(/https:\/\/(cdn|media).(discordapp|discord).(com|net)\/.*.(png|jpeg|jpg|webp|gif)/gmi)[0]
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
        } else {
            interaction.reply({ content: 'Please provide a valid image link or attachment. **Note that for application security purposes, the image link must be from Discord (Uses the cdn.disordapp.com link).**', ephemeral: true })
        }
    }
}
