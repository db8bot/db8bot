const puppeteer = require('puppeteer')
exports.run = async function (client, message, args) {
  const superagent = require('superagent');
  require('superagent-proxy')(superagent);
  const fs = require('fs')
  const Discord = require('discord.js');
  var guild = message.guild;
  const config = client.config;

  superagent
    .get(`https://www.bloomberg.com/news/articles/2021-01-25/revenge-of-megacaps-hurts-investors-fading-the-oligarchic-era?sref=P4HMHSEZ`)
    // .proxy(`https://140.227.63.136`)
    // .set("Cache-Control", "no-cache")
    .set('User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
    .set("Accept", "*/*")
    // .set("Accept", "text/html")
    // .set("Accept-Encoding", "")
    .set("Connection", "keep-alive")
    .set("X-Forwarded-For", "66.102.0.0")
    // .set("Referer", "https://t.co/")
    // .redirects(20)
    // .set('Host', "www.bloomberg.com")
    .end((err, res) => {
      console.log(res.text)
    })

  // async function toPDF(html) {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();

  // await page.setContent(html)
  // await page.goto(`https://www.bloomberg.com/news/articles/2021-01-25/revenge-of-megacaps-hurts-investors-fading-the-oligarchic-era?sref=P4HMHSEZ`)
  // await page.goto(`https://www.bloomberg.com/news/articles/2021-04-24/behold-the-u-s-economy-s-recovery-as-fed-stays-course-eco-week`)
  await page.goto(`https://www.bloomberg.com/news/articles/2021-04-24/rich-americans-hunt-for-ways-around-tax-hikes-they-were-warned-about?srnd=premium`)

  // const pdf = await page.pdf({
  //   format: 'Letter', margin: {
  //     left: '2.54cm',
  //     top: '2.54cm',
  //     right: '2.54cm',
  //     bottom: '2.54cm'
  //   }
  // });

  // await browser.close();
  // return pdf
  // }
}