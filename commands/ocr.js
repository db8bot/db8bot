const { SlashCommandBuilder } = require('@discordjs/builders')
const { createWorker } = require('tesseract.js')

const worker = createWorker()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ocr')
        .setDescription('Recognize text within images')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('image to perform OCR on')
                .setRequired(true)
        ),
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const image = interaction.options.getAttachment('image')
        console.log(interaction.options.getAttachment('image').contentType)
        console.log(interaction.options.getAttachment('image').proxyURL)
        console.log(interaction.options.getAttachment('image').url)

        if (image.contentType.includes('image')) {
            await interaction.reply('OCR Request has been added to the queue. You should see a message in this channel with the OCRed content shortly.')
            await worker.load()
            await worker.loadLanguage('eng')
            await worker.initialize('eng')
            const { data: { text } } = await worker.recognize(image.url)
            await interaction.channel.send('```' + text.trim() + '```')
            await worker.terminate()
        }
    }
}
