/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Jim Fang. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
client.config = require("./config.json");
const fs = require("fs");
const Enmap = require("enmap");
const chalk = require('chalk');
const winston = require('winston')
var base64url = require('base64-url');
const { exec } = require("child_process");
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://3a8ab5afe5824525ac1f41ebe688fbd0@sentry.io/5188131' });

// ---------------REQUIRE BREAK--------------------


client.logger = new winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './log.txt' })
    ]
})
client.indexLogger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'log.txt' })
    ]
})

client.rounds = new Enmap({ name: "rounds" });
client.optINOUT = new Enmap({ name: "optINOUT" });

client.on('error', console.error);

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    console.log(chalk.green("|--------------------(Loading Commands)------------------------|"));
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(chalk.green(`Loading command ${commandName}`));
        client.commands.set(commandName, props);
    });
});

// ---------------LISTENERS & FILE READS BREAK--------------------

//eval cleaner
function clean(text) {
    if (typeof (text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}
var rand = getRandomIntInclusive(1, 100);

// -----------------MESSAGE HANDLERS & COMMANDS------------------

client.on('message', async message => {
    const doExec = (cmd, opts = {}) => { // -exec function
        return new Promise((resolve, reject) => {
            exec(cmd, opts, (err, stdout, stderr) => {
                if (err) return reject({ stdout, stderr });
                resolve(stdout);
            });
        });
    };
    const outputErr = (msg, stdData) => {
        let { stdout, stderr } = stdData;
        stderr = stderr ? ["`STDERR`", "```sh", clean(stderr.substring(0, 800)) || " ", "```"] : [];
        stdout = stdout ? ["`STDOUT`", "```sh", clean(stdout.substring(0, stderr ? stderr.length : 2046 - 40)) || " ", "```"] : [];
        let message = stdout.concat(stderr).join("\n").substring(0, 2000);
        msg.edit(message);
    };

    //command & args
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // client.options.disableEveryone = true;
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;

    if (command === "prefix") {
        if (message.author.id === config.owner) {
            config.prefix = args.join(' ');
            fs.writeFile('./config.json', JSON.stringify(config, null, 2), function (err) {
                if (err) return console.error(err);
                message.channel.send(`Prefix Successfully Changed to ${config.prefix}.`)
            });
        } else {
            message.reply("Only the bot owner can change the prefix.")
        }

    }
    else if (command === "eval") {
        var x, y;
        if (message.author.id !== config.owner) return;
        x = Date.now()
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
            y = Date.now()
            message.channel.send(`:white_check_mark: Success! Time taken: \`${y - x}ms\``)
            message.channel.send(clean(evaled), { code: "xl" });
        } catch (err) {
            y = Date.now()
            message.channel.send(`:x: Error! Time taken: \`${y - x}ms\``)
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }

    }
    else if (command === "ownerhelp") {
        if (message.author.id === config.owner) {
            const ownercmds = new Discord.MessageEmbed()
                .setColor("#ffd700")
                // .setDescription("If you are not the owner, this list is just to make you jealous... Hehe - Owner superpowers :p")
                // .addField("Upload to Pastebin when eval", "cmd: setpastebineval")
                // .addField("Set if bot creates mute role when joining a server", "cmd: setmuterole")
                // .addField("upload result file when eval", "cmd: setuploadfileeval")
                .addField("Set bot game", "cmd: setgame <args>")
                .addField("Set bot status", "cmd: setstatus <args>")
                .addField("Get all of the servers bot is in", "cmd: getallserver")
                .addField("leaves the inputed server. Server name has to be exact.", "cmd: leaveserver <args>")
                .addField("broadcast a message", "cmd: broadcast <message/args>")
                .addField("get log", "cmd: getlog")
                .addField("Emergency STOP, incase things get out of control requires pm2, otherwise use restart", "cmd: killall")
                .addField("Manual restart", "cmd: restart requries pm2, otherwise works as a killall cmd")
                .addField("exec cmd/bash scripts", "cmd: exec <args>")
                .addField("evals code from discord chatbox", "cmd: eval <code>")
                .addField("change the bot's prefix", "cmd: prefix <new prefix which no one will know>")
                .addField("spyon servers by gening invites", "cmd:spyon <server name>")
                // .addField("get all loaded user info", "cmd: alluserinfo")
                .addField(`Get the host machine's IP address ONLY!`, "cmd: -gethostip")
                .addField(`Send Msg to a server`, `cmd: sendmsgto <server name: exact> <msg>`)

            message.channel.send({ embed: ownercmds })
        }
    }
    else if (command === "setgame") {
        if (message.author.id === config.owner) {
            client.user.setActivity(args.join(' '))

        }
        else {
            message.channel.send("Insufficant Permissions!")
        }
    }
    else if (command === "setstatus") {
        if (message.author.id === config.owner) {
            client.user.setStatus(args.join(' '));
        }
    }
    else if (command === "getallserver") {
        if (message.author.id === config.owner) {
            let user = message.author;
            user.send(client.guilds.cache.map(e => e.toString()).join(`, `));

        }
        else {
            return message.channel.send("Insufficant Permissions");
        }
    }
    else if (command === 'getinfoserver') {
        const getx = client.guilds.cache.find(server => server.id === args.join(' '))
        message.author.send(getx.name)
    }
    else if (command === "broadcast") {
        if (message.author.id === config.owner) {
            function getDefaultChannel(guild) {
                if (guild.channels.cache.some(name1 => name1.name === "general"))
                    return guild.channels.cache.find(name => name.name === "general");
                // Now we get into the heavy stuff: first channel in order where the bot can speak
                // hold on to your hats!
                return guild.channels.cache
                    .filter(c => c.type === "text" &&
                        c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
                    .sort((a, b) => a.position - b.position ||
                        Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
                    .first();
            }
            client.guilds.cache.map(e => getDefaultChannel(e).send(args.join(' ')))

        }
        else {
            return message.channel.send("Insufficant Permissions");
        }
    }
    else if (command === "sendmsgto") {
        function getDefaultChannel(guild) {
            if (guild.channels.cache.some(name1 => name1.name === "general"))
                return guild.channels.cache.find(name => name.name === "general");
            // Now we get into the heavy stuff: first channel in order where the bot can speak
            // hold on to your hats!
            return guild.channels.cache
                .filter(c => c.type === "text" &&
                    c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
                .sort((a, b) => a.position - b.position ||
                    Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
                .first();
        }
        getDefaultChannel(client.guilds.cache.find(server => server.name === args[0])).send(args.slice(1).join(' '))
    }
    else if (command === "leaveserver") {
        if (message.author.id === config.owner) {
            guild = client.guilds.cache.find(val => val.name === args.join(' ')).leave();
        }
        else message.channel.send("Insufficant Permissions.")
    }
    else if (command === "getlog") {
        if (message.author.id === config.owner) {
            let user = message.author;
            user.send({ files: ['log.txt'] })
        }
        else {
            message.reply("Insufficant Permissions")
        }
    }
    else if (command === "restart") {

        if (message.author.id === config.owner && args.join(' ') === "") {

            message.channel.send(config.name + " is restarting...")
            message.reply(":white_check_mark: Restart should be complete, check -botinfo for confirmation.")

            setTimeout(function () {
                process.abort();
            }, 1000);
        } else if (message.author.id === '646956106827956233' || message.author.id === config.owner) {
            var goVerifyRestart = false
            if (message.author.id === config.owner && args.join(' ') === "verify") {
                goVerifyRestart = true
            } else if (author.id === '646956106827956233') {
                goVerifyRestart = true;
            }
            if (goVerifyRestart) {
                message.channel.send(`Authorized ${message.author.tag}. Restarting verify.py - verify bot #7802...`)
                message.reply(`:white_check_mark: Restart complete.`)
                setTimeout(async function () {
                    const command = `pm2 restart verify` // add exec cmd to credits NOTE: 0 = powerbot or default host of the code [add in readme that make sure process is in #0 if using pm2] 1 = signature
                    const outMessage = await message.channel.send(`Running \`${command}\`...`);
                    let stdOut = await doExec(command).catch(data => outputErr(outMessage, data));
                    stdOut = stdOut.substring(0, 1750);
                    outMessage.edit(`\`OUTPUT\`
          \`\`\`sh
          ${clean(stdOut)}
          \`\`\``);
                }, 3000);
            }
        } else {
            message.channel.send("Insufficant Permissions")
        }
    }
    else if (command === "killall") {
        client.users.cache.find(val1 => val1.id === config.owner).send(`KILLALL COMMAND HAS BEEN ACTIVATED | ID: ${message.author.id} | Tag: ${message.author.tag} | Server: ${message.guild} `)
        if (message.author.id === config.owner) {
            var check = base64url.encode(rand.toString())
            if (!args.join(' ')) {
                message.channel.send('Please get a password! It has been Directly Messaged to you!')
                message.author.send("Base 64 of " + rand)
                message.author.send("Then remove any equal signs(=) from the result!")
            }
            else if (args.join(' ') === check) {
                message.channel.send("Success! View host console for more information. PowerBot shutting down...")
                console.log(chalk.green("PowerBot has been shutdown via Discord Chatbox."))
                console.log(chalk.green("Here are some Information:"))
                console.log(chalk.green(`Auth: ${message.author.username}#${message.author.discriminator} ID: ${message.author.id}`))
                console.log(chalk.green(`Timestamp: ${Date()}`))
                let versionSelector = 0;
                // USE IF 2 VERSIONS OF BOT ARE HOSTED
                // if (config.name === "PowerBot Signature Edition™#0636") {
                //     let versionSelector = 1;
                // }
                setTimeout(async function () {
                    const command = `pm2 stop ${versionSelector}` // add exec cmd to credits NOTE: 0 = powerbot or default host of the code [add in readme that make sure process is in #0 if using pm2] 1 = signature
                    const outMessage = await message.channel.send(`Running \`${command}\`...`);
                    let stdOut = await doExec(command).catch(data => outputErr(outMessage, data));
                    stdOut = stdOut.substring(0, 1750);
                    outMessage.edit(`\`OUTPUT\`
              \`\`\`sh
              ${clean(stdOut)}
              \`\`\``);
                }, 3000);
            }
            else {
                console.log(check)
                message.channel.send("Incorrect Password")
            }
        } else {
            message.channel.send("Insufficant Permissions")
        }
    }
    else if (command === "exec") {

        if (message.author.id === config.owner) {
            const command = args.join(" ");
            const outMessage = await message.channel.send(`Running \`${command}\`...`);
            let stdOut = await doExec(command).catch(data => outputErr(outMessage, data));
            stdOut = stdOut.substring(0, 1750).catch(err => console.log(err))
            outMessage.edit(`\`OUTPUT\`
      \`\`\`sh
      ${clean(stdOut)}
      \`\`\``);
        } else {
            message.reply("Only the bot owner can use this command")
        }
    }
});

var token = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
client.on("debug", error => {
    console.log(chalk.cyan(error.replace(token, "HIDDEN")));
});
client.on("warn", error => {
    console.log(chalk.yellow(error.replace(token, "HIDDEN")));
});
// client.on("err", error => {
//     console.log(chalk.red(error.replace(token, "HIDDEN")));
// }); //Broken
client.on("error", (error) => {
    console.error(chalk.red(error.replace(token, "HIDDEN")));
});

client.login(client.config.token);