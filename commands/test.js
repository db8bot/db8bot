exports.run = function (client, message, args) {
    const superagent = require('superagent');
    const fs = require('fs')
    const Discord = require('discord.js');
    var guild = message.guild;
    const config = client.config;
    const PDFDocument = require('pdfkit');
    var pdf = require('html-pdf');
    var html = fs.readFileSync('responseNews.html', 'utf-8')
    var conversion = require("phantom-html-to-pdf")();
    console.log(`on`)
    // superagent
    //     // .get(`https://www.foreignaffairs.com/articles/china/2011-08-19/inevitable-superpower`)
    //     .get(`https://www.wsj.com/articles/discord-ends-deal-talks-with-microsoft-11618938806`)
    //     // .set("Cache-Control", "no-cache")
    //     // .set('User-Agent', "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36")
    //     // .set("Accept", "*/*")
    //     // .set("Accept-Encoding", "gzip, deflate, br")
    //     // .set("Connection", "keep-alive")
    //     .end((err, res) => {
    //         conversion({ html: res.text.replace(/<input/g, "<blank") }, function (err, pdf) {
    //             var output = fs.createWriteStream('output.pdf')
    //             pdf.stream.pipe(output)
    //         })

    //     })

    // conversion({ html: html }, function (err, pdf) {
    //     var output = fs.createWriteStream('output.pdf')
    //     pdf.stream.pipe(output)
    // })

    pdf.create(html, {format: 'Letter'}).toFile('output.pdf', function(err, res) {
        if (err) return console.log(err);
        console.log(res); // { filename: '/app/businesscard.pdf' }
      });

}