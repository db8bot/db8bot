exports.run = function (client, message, args) {
    const superagent = require('superagent');
    const PNG = require("pngjs").PNG;
    const fs = require('fs')
    const Discord = require('discord.js');
    var guild = message.guild;
    const config = client.config;

    superagent
        .get(`https://www.foreignaffairs.com/articles/china/2011-08-19/inevitable-superpower`)
        .set("Cache-Control", "no-cache")
        .set('User-Agent', "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36")
        .set("Accept", "*/*")
        .set("Accept-Encoding", "gzip, deflate, br")
        .set("Connection", "keep-alive")
        .end((err, res) => {
            console.log(res.text)
        })
}