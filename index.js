// https://discordapp.com/oauth2/authorize?client_id=689368779305779204&scope=bot&permissions=2146958847
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
client.config = require("./config.json");
const fs = require("fs");
const Enmap = require("enmap");
// Require our logger
client.logger = require("./modules/Logger.js");

// Let's start by getting some useful functions that we'll use throughout
// the bot, like logs and elevation features.
// require("./modules/functions.js")(client);



// client.on('ready', () => {
//     console.log(`Logged in at ${Date()} in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
// });

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
// client.aliases = new Enmap();

fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
    });
});


//eval cleaner
function clean(text) {
    if (typeof (text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}


client.on('message', async message => {
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

        if (message.author.id !== config.owner) return;
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

            message.channel.send(clean(evaled), { code: "xl" });
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }

    }

});

client.login(client.config.token);