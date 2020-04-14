exports.run = function (client, message, args) {
    function countdown(seconds, roundName, speechName) {
        // var seconds = 60;
        function tick() {
            // var counter = document.getElementById("counter");
            seconds--;
            // counter.innerHTML = "0:" + (seconds < 10 ? "0" : "") + String(seconds);
            if (seconds > 0) {
                setTimeout(tick, 1000);
            } else {
                message.channel.send(`${speechName} time is over for the round: ${roundName}. @Currently Debating @Currently Judging`)
            }
        }
        tick();
    }
    const Discord = require('discord.js');
    var guild = message.guild;
    var Timer = require('clockmaker').Timer,
    Timers = require('clockmaker').Timers;
    client.logger.log('info', `startspeech command used by ${message.author.tag} ID: ${message.author.id} Time: ${Date()} Guild: ${message.guild}`)
    const config = client.config;
    const help = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}startspeech`)
        .addField("**Usage:**", `${config.prefix}startspeech <roundname>`)
        .addField("**Example:**", `${config.prefix}startround AF-v-ND`)
        .addField("**Expected Result From Example:**", "Bot will start a timer according to your round type.")
    if (args.join(' ') === "") {
        message.channel.send({ embed: help })
        return;
    }

    var roundInfo = client.rounds.get(guild.id + args[0]);
    if (roundInfo === undefined) {
        message.channel.send({ embed: help })
        return;
    }

    if (roundInfo.type.toLowerCase().indexOf("policy") != -1 || roundInfo.type.toLowerCase().indexOf("cx") != -1 || roundInfo.type.toLowerCase().indexOf("pol") != -1) {
        if (roundInfo.speech === "") {
            //1ac
            client.rounds.setProp(guild.id + args[0], "speech", "1AC")
            // console.log(client.rounds.getProp(guild.id + args[0], "speech"))
            message.reply(`1AC started! 8 minutes remaining.`)
            // countdown(480);
            countdown(480, args[0], '1AC'); //add name recognition so when time ends we know which round the timer belongs to
        } else if (roundInfo.speech === "1AC") {
            //cx1
            client.rounds.setProp(guild.id + args[0], "speech", "CX1")
            message.reply(`1st CX started! 3 minutes remaining.`)
            countdown(180, args[0], '1st CX');
        } else if (roundInfo.speech === "CX1") {
            //1nc
            client.rounds.setProp(guild.id + args[0], "speech", "1NC")
            message.reply(`1NC started! 8 minutes remaining.`)
            countdown(480, args[0], '1NC');
        } else if (roundInfo.speech === "1NC") {
            //cx2
            message.reply(`2nd CX started! 3 minutes remaining.`)
            client.rounds.setProp(guild.id + args[0], "speech", "CX2")
            countdown(180, args[0], '2nd CX');
        } else if (roundInfo.speech === "CX2") {
            //2ac
            client.rounds.setProp(guild.id + args[0], "speech", "2AC")
            message.reply(`2AC started! 8 minutes remaining.`)
            countdown(480, args[0], '2AC');
        } else if (roundInfo.speech === "2AC") {
            //cx3
            message.reply(`3rd CX started! 3 minutes remaining.`)
            client.rounds.setProp(guild.id + args[0], "speech", "CX3")
            countdown(180, args[0], '3rd CX');
        } else if (roundInfo.speech === "CX3") {
            //2nc
            client.rounds.setProp(guild.id + args[0], "speech", "2NC")
            message.reply(`2NC started! 8 minutes remaining.`)
            countdown(480, args[0], '2NC');
        } else if (roundInfo.speech === "2NC") {
            //cx4
            client.rounds.setProp(guild.id + args[0], "speech", "CX4")
            message.reply(`4th CX started! 3 minutes remaining.`)
            countdown(180, args[0], '4th CX');
        } else if (roundInfo.speech === "CX4") {
            //1nr
            message.reply(`1NR started! 5 minutes remaining.`)
            client.rounds.setProp(guild.id + args[0], "speech", "1NR")
            countdown(300, args[0], '1NR');
        } else if (roundInfo.speech === "1NR") {
            //1ar
            client.rounds.setProp(guild.id + args[0], "speech", "1AR")
            message.reply(`1AR started! 5 minutes remaining.`)
            countdown(300, args[0], '1AR');
        } else if (roundInfo.speech === "1AR") {
            //2nr
            client.rounds.setProp(guild.id + args[0], "speech", "2NR")
            message.reply(`2NR started! 5 minutes remaining.`)
            countdown(300, args[0], '2NR');
        } else if (roundInfo.speech === "2NC") {
            //2ar
            client.rounds.setProp(guild.id + args[0], "speech", "2AR")
            message.reply(`2AR started! 5 minutes remaining.`)
            countdown(300, args[0], '2AR');
        }
    }
    else if (roundInfo.type.toLowerCase().indexOf("lincoln") != -1 || roundInfo.type.toLowerCase().indexOf("douglas") != -1 || roundInfo.type.toLowerCase().indexOf("ld") != -1) {
        if (roundInfo.speech === "") {
            client.rounds.setProp(guild.id + args[0], "speech", "AC")
            message.reply(`AC started! 6 minutes remaining.`)
            countdown(360, args[0], 'AC');
        } else if (roundInfo.speech === "AC") {
            client.rounds.setProp(guild.id + args[0], "speech", "CX1")
            message.reply(`1st CX started! 3 minutes remaining.`)
            countdown(180, args[0], '1st CX');
        } else if (roundInfo.speech === "CX1") {
            client.rounds.setProp(guild.id + args[0], "speech", "NC")
            message.reply(`NC (1NR) started! 7 minutes remaining.`)
            countdown(420, args[0], 'NC (1NR)');
        } else if (roundInfo.speech === "NC") {
            client.rounds.setProp(guild.id + args[0], "speech", "CX2")
            message.reply(`2nd CX started! 3 minutes remaining.`)
            countdown(180, args[0], '2nd CX');
        } else if (roundInfo.speech === "CX2") {
            client.rounds.setProp(guild.id + args[0], "speech", "1AR")
            message.reply(`1AR started! 4 minutes remaining.`)
            countdown(240, args[0], '1AR');
        } else if (roundInfo.speech === "1AR") {
            client.rounds.setProp(guild.id + args[0], "speech", "NR")
            message.reply(`NR started! 6 minutes remaining.`)
            countdown(360, args[0], 'NR');
        } else if (roundInfo.speech === "NR") {
            client.rounds.setProp(guild.id + args[0], "speech", "2AR")
            message.reply(`2AR started! 3 minutes remaining.`)
            countdown(180, args[0], '2AR');
        }
    }
    else if (roundInfo.type.toLowerCase().indexOf("pf") != -1 || roundInfo.type.toLowerCase().indexOf("pufo") != -1 || roundInfo.type.toLowerCase().indexOf("public") != -1 || roundInfo.type.toLowerCase().indexOf("forum") != -1) {
        if (roundInfo.speech === "") {
            client.rounds.setProp(guild.id + args[0], "speech", "Constructive A")
            message.reply(`Constructive for team A started! 4 minutes remaining.`)
            countdown(240, args[0], 'Constructive A');
        } else if (roundInfo.speech === "Constructive A") {
            client.rounds.setProp(guild.id + args[0], "speech", "Constructive B")
            message.reply(`Constructive for team B started! 4 minutes remaining.`)
            countdown(240, args[0], 'Constructive B');
        } else if (roundInfo.speech === "Constructive B") {
            client.rounds.setProp(guild.id + args[0], "speech", "Crossfire 1")
            message.reply(`Crossfire 1 started! 3 minutes remaining.`)
            countdown(180, args[0], 'Crossfire 1');
        } else if (roundInfo.speech === "Crossfire 1") {
            client.rounds.setProp(guild.id + args[0], "speech", "Rebuttle A")
            message.reply(`Rebuttle for team A started! 4 minutes remaining.`)
            countdown(240, args[0], 'Rebuttle A');
        } else if (roundInfo.speech === "Rebuttle A") {
            client.rounds.setProp(guild.id + args[0], "speech", "Rebuttle B")
            message.reply(`Rebuttle for team B started! 4 minutes remaining.`)
            countdown(240, args[0], 'Rebuttle B');
        } else if (roundInfo.speech === "Rebuttle B") {
            client.rounds.setProp(guild.id + args[0], "speech", "Crossfire 2")
            message.reply(`Crossfire 2 started! 3 minutes remaining.`)
            countdown(180, args[0], 'Rebuttle B');
        } else if (roundInfo.speech === "Crossfire 2") {
            client.rounds.setProp(guild.id + args[0], "speech", "Summary A")
            message.reply(`Summary for team A started! 3 minutes remaining.`)
            countdown(180, args[0], 'Summary A');
        } else if (roundInfo.speech === "Summary A") {
            client.rounds.setProp(guild.id + args[0], "speech", "Summary B")
            message.reply(`Summary for team B started! 3 minutes remaining.`)
            countdown(180, args[0], 'Summary B');
        } else if (roundInfo.speech === "Summary B") {
            client.rounds.setProp(guild.id + args[0], "speech", "Grand crossfire")
            message.reply(`Grand crossfire started! 3 minutes remaining.`)
            countdown(180, args[0], 'Grand crossfire');
        } else if (roundInfo.speech === "Grand crossfire") {
            client.rounds.setProp(guild.id + args[0], "speech", "Final Focus A")
            message.reply(`Final Focus for team A started! 2 minutes remaining.`)
            countdown(120, args[0], 'Final Focus A');
        } else if (roundInfo.speech === "Final Focus A") {
            client.rounds.setProp(guild.id + args[0], "speech", "Final Focus B")
            message.reply(`Final Focus for team B started! 2 minutes remaining.`)
            countdown(180, args[0], 'Final Focus B');
        }
    }
}
