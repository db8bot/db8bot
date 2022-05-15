const { SlashCommandBuilder } = require('@discordjs/builders')

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
        console.log(interaction.options.getAttachment('image').contentType)
        console.log(interaction.options.getAttachment('image').proxyURL)
        console.log(interaction.options.getAttachment('image').url)
    }
}
