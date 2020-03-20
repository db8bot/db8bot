exports.run = function (client, message, args) {

    const superagent = require('superagent');
    // const fs = require("fs");
    // const request = require("request-promise-native");

    superagent
        .get(`https://sci-hub.tw/${args.join(' ')}`)
        .end((err, res) => {
            // Calling the end function will send the request
            var found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)

            if (found[1].indexOf("https")===-1) {
                found[1]="https:"+found[1];
            }
            // message.channel.send(found)
            // async function downloadPDF(pdfURL, outputFilename) {
            //     let pdfBuffer = await request.get({ uri: pdfURL, encoding: null });
            //     console.log("Writing downloaded PDF file to " + outputFilename + "...");
            //     fs.writeFileSync(outputFilename, pdfBuffer);
            // }

            // downloadPDF(found[1], `./${args.join(' ')}`);
            message.channel.send({
                files: [found[1]+".pdf"]
            }).catch(console.error);
        })



}