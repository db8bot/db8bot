const { SlashCommandBuilder } = require('discord.js')
const { createWorker } = require('tesseract.js')
const { v4: uuidv4 } = require('uuid')

async function ocr(interaction, source) {
    const worker = createWorker()
    var jobOwner = !interaction.member ? null : interaction.member.id
    var jobID = uuidv4()
    await interaction.reply(`OCR Request has been added to the queue. You should see a message in this channel with the OCRed content shortly. Job ID: \`${jobID}\``)
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    const { data: { text } } = await worker.recognize(source)
    await interaction.channel.send({ content: `<@${!jobOwner ? '' : jobOwner}> | Job: \`${jobID}\``, files: [{ attachment: Buffer.from(text.trim()), name: `${jobID}OCR.txt` }] })
    await worker.terminate()
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ocr')
        .setDescription('Recognize text within images')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('image to perform OCR on')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('link')
                .setDescription('link to the image (ex: cdn.discordapp.com)')
                .setRequired(false)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const source = interaction.options.getAttachment('image') || interaction.options.getString('link')
        if (!source) {
            interaction.reply('Please supply either an image or link for OCR.')
            return
        }
        if (source.contentType !== undefined) {
            if (source.contentType.includes('image')) {
                ocr(interaction, source.url)
            }
        } else if (source.trim().match(/https:\/\/(cdn|media).(discordapp|discord).(com|net)\/.*.(png|jpeg|jpg|webp|gif)/g)) {
            ocr(interaction, source.match(/https:\/\/(cdn|media).(discordapp|discord).(com|net)\/.*.(png|jpeg|jpg|webp|gif)/gmi)[0])
        }
    }
}
