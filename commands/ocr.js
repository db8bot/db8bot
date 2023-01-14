const { SlashCommandBuilder } = require('discord.js')
const { v4: uuidv4 } = require('uuid')
const superagent = require('superagent')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ocr')
        .setDescription('Recognize text within images')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('image to perform optical character recognition on')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('link')
                .setDescription('link to the image (ex: cdn.discordapp.com)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('language')
                .setDescription('language to use for character recognition - TYPE TO SEE AVAILABLE LANGUAGES; defaults to english')
                .setRequired(false)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const choicesMap = {
            afr: 'Afrikaans',
            amh: 'Amharic',
            ara: 'Arabic',
            asm: 'Assamese',
            aze: 'Azerbaijani',
            aze_cyrl: 'Azerbaijani - Cyrillic',
            bel: 'Belarusian',
            ben: 'Bengali',
            bod: 'Tibetan',
            bos: 'Bosnian',
            bul: 'Bulgarian',
            cat: 'Catalan, Valencian',
            ceb: 'Cebuano',
            ces: 'Czech',
            chi_sim: 'Chinese - Simplified',
            chi_tra: 'Chinese - Traditional',
            chr: 'Cherokee',
            cym: 'Welsh',
            dan: 'Danish',
            deu: 'German',
            dzo: 'Dzongkha',
            ell: 'Greek, Modern (1453-)',
            eng: 'English',
            enm: 'English, Middle (1100-1500)',
            epo: 'Esperanto',
            est: 'Estonian',
            eus: 'Basque',
            fas: 'Persian',
            fin: 'Finnish',
            fra: 'French',
            frk: 'German Fraktur',
            frm: 'French, Middle (ca. 1400-1600)',
            gle: 'Irish',
            glg: 'Galician',
            grc: 'Greek, Ancient (-1453)',
            guj: 'Gujarati',
            hat: 'Haitian, Haitian Creole',
            heb: 'Hebrew',
            hin: 'Hindi',
            hrv: 'Croatian',
            hun: 'Hungarian',
            iku: 'Inuktitut',
            ind: 'Indonesian',
            isl: 'Icelandic',
            ita: 'Italian',
            ita_old: 'Italian - Old',
            jav: 'Javanese',
            jpn: 'Japanese',
            kan: 'Kannada',
            kat: 'Georgian',
            kat_old: 'Georgian - Old',
            kaz: 'Kazakh',
            khm: 'Central Khmer',
            kir: 'Kirghiz, Kyrgyz',
            kor: 'Korean',
            kur: 'Kurdish',
            lao: 'Lao',
            lat: 'Latin',
            lav: 'Latvian',
            lit: 'Lithuanian',
            mal: 'Malayalam',
            mar: 'Marathi',
            mkd: 'Macedonian',
            mlt: 'Maltese',
            msa: 'Malay',
            mya: 'Burmese',
            nep: 'Nepali',
            nld: 'Dutch, Flemish',
            nor: 'Norwegian',
            ori: 'Oriya',
            pan: 'Panjabi, Punjabi',
            pol: 'Polish',
            por: 'Portuguese',
            pus: 'Pushto, Pashto',
            ron: 'Romanian, Moldavian, Moldovan',
            rus: 'Russian',
            san: 'Sanskrit',
            sin: 'Sinhala, Sinhalese',
            slk: 'Slovak',
            slv: 'Slovenian',
            spa: 'Spanish, Castilian',
            spa_old: 'Spanish, Castilian - Old',
            sqi: 'Albanian',
            srp: 'Serbian',
            srp_latn: 'Serbian - Latin',
            swa: 'Swahili',
            swe: 'Swedish',
            syr: 'Syriac',
            tam: 'Tamil',
            tel: 'Telugu',
            tgk: 'Tajik',
            tgl: 'Tagalog',
            tha: 'Thai',
            tir: 'Tigrinya',
            tur: 'Turkish',
            uig: 'Uighur, Uyghur',
            ukr: 'Ukrainian',
            urd: 'Urdu',
            uzb: 'Uzbek',
            uzb_cyrl: 'Uzbek - Cyrillic',
            vie: 'Vietnamese',
            yid: 'Yiddish'
        }
        const focusedValue = interaction.options.getFocused()
        const choices = Object.values(choicesMap)
        const filtered = choices.filter(choice => (choice.toLowerCase().startsWith(focusedValue.toLowerCase())))
        let options
        if (filtered.length > 25) {
            options = filtered.slice(0, 25)
        } else {
            options = filtered
        }

        await interaction.respond(
            options.map(choice => ({ name: choice, value: Object.keys(choicesMap).find(k => choicesMap[k] === choice) }))
        )
    },
    async execute(interaction) {
        require('../modules/telemetry').telemetry(__filename, interaction)
        const source = interaction.options.getString('link') || (interaction.options.getAttachment('image') !== null ? interaction.options.getAttachment('image').url : null)
        const lang = interaction.options.getString('language') || 'eng'
        if (source !== null && (source.trim().match(/https:\/\/(cdn|media).(discordapp|discord).(com|net)\/.*.(png|jpeg|jpg|webp|gif)/g))) {
            var jobID = uuidv4()
            // send request
            await interaction.reply(`OCR Request has been added to the queue. You should see a message in this channel with the OCRed content shortly. Job ID: \`${jobID}\``)

            superagent
                .post(`${process.env.BLAZEURL}/ocr`)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({
                    auth: process.env.BLAZEAUTH,
                    serverID: (interaction.inGuild()) ? interaction.guildId : null,
                    channelID: interaction.channelId,
                    memberID: (interaction.member) ? interaction.member.id : null,
                    jobID,
                    lang,
                    source: source.trim().match(/https:\/\/(cdn|media).(discordapp|discord).(com|net)\/.*.(png|jpeg|jpg|webp|gif)/gmi)[0],
                    time: Date.now(),
                    dmUser: interaction.user.id
                })
                .end((err, res) => {
                    if (err) console.error(err)
                })
        } else {
            interaction.reply('Please supply either an image or link for OCR.')
        }
    }
}
