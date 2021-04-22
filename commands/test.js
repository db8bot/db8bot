const puppeteer = require('puppeteer')
exports.run = async function (client, message, args) {
  const superagent = require('superagent');
  const fs = require('fs')
  const Discord = require('discord.js');
  var guild = message.guild;
  const config = client.config;

  function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var userAgents = [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (compatible; adidxbot/2.0; +http://www.bing.com/bingbot.htm)"
  ]
  // https://evert.meulie.net/faqwd/googlebot-ip-ranges/
  var xforwardedfors = [
    "66.102.0.0",
    "64.18.0.0",
    "64.233.160.0"
  ]
  var userAgent = userAgents[getRndInteger(0, userAgents.length - 1)]
  console.log(userAgent)
  var xforwardedfor = xforwardedfors[getRndInteger(0, xforwardedfors.length - 1)]
  console.log(xforwardedfor)
  console.log(`on`)
  superagent
    // .get(`https://www.foreignaffairs.com/articles/china/2011-08-19/inevitable-superpower`)
    .get(`https://www.wsj.com/articles/discord-ends-deal-talks-with-microsoft-11618938806`)
    .set("Cache-Control", "no-cache")
    .set('User-Agent', userAgent)
    .set("Accept", "*/*")
    .set("Accept-Encoding", "gzip, deflate, br")
    .set("Connection", "keep-alive")
    .set("X-Forwarded-For", xforwardedfor)
    .set("Referer", "https://t.co/")
    .end(async (err, res) => {
      var filename = "./newsTempOutFiles/" + getRndInteger(999, 999999).toString() + message.channel.id + "x" + ".pdf"
      var result = await toPDF(res.text.replace(/<input/g, "<blank"))
      fs.writeFile(filename.toString(), result, function (err) {
        if (err) return console.log(err)
      })
      setTimeout(() => {
        message.channel.send({ files: [filename] })
      }, 700);
      // setTimeout(() => {
      //   fs.unlink(fileName, (err) => {
      //     if (err) console.log(err)
      //     console.log(`${fileName} was deleted.`)
      //   })
      // }, 1700);
    })

  // conversion({ html: html }, function (err, pdf) {
  //     var output = fs.createWriteStream('output.pdf')
  //     pdf.stream.pipe(output)
  // })

  // pdf.create(html, {format: 'Letter'}).toFile('output.pdf', function(err, res) {
  //     if (err) return console.log(err);
  //     console.log(res); // { filename: '/app/businesscard.pdf' }
  //   });

  // document.html(html)
  // document.save('output.pdf')

}

async function toPDF(html) {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: null });
  const page = await browser.newPage();

  await page.setContent(html)

  const pdf = await page.pdf({
    format: 'Letter', margin: {
      left: '2.54cm',
      top: '2.54cm',
      right: '2.54cm',
      bottom: '2.54cm'
    }
  });

  await browser.close();
  return pdf
}