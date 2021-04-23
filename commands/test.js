const puppeteer = require('puppeteer')
exports.run = async function (client, message, args) {
  const superagent = require('superagent');
  const fs = require('fs')
  const Discord = require('discord.js');
  var guild = message.guild;
  const config = client.config;

  superagent
    .get(`https://www.economist.com/the-economist-explains/2021/04/21/why-does-the-international-criminal-court-not-have-more-support`)
    .set("Cache-Control", "no-cache")
    // .set('User-Agent', userAgent)
    // .set("Accept", "*/*")
    .set("Accept", "*/*")
    .set("Accept-Encoding", "")
    .set("Connection", "keep-alive")
    // .set("X-Forwarded-For", xforwardedfor)
    // .set("Referer", "https://t.co/")
    .end((err, res) => {
      console.log(res.text)
    })
}