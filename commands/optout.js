exports.run = function (client, message, args, args2, cmd) {
    const Discord = require('discord.js');
    var guild = message.guild;
    const config = client.config;

    const embed1 = new Discord.MessageEmbed()
        .setColor("#f0ffff")
        .setDescription("**Command: **" + `${config.prefix}dm`)
        .addField("**Usage:**", `${config.prefix}dm <@username> <Your message>`)
        .addField("**Example:**", `${config.prefix}dm @AirFusion hello`)
        .addField("**Expected Result From Example:**", "Mentioned user should get a DM from the bot with the correct message & message in chat should be deleted.")

    // console.log(args)
    // console.log(args[0])
    var cmds = "commands help embed feedback invite ping say serverinv dm lockdown mute unmute purge setup botinfo serverinfo userinfo get setspeech endround roundstatus flip judgeinfo speeches communism capitalism trump baudrillard bataille"
    if (cmds.indexOf(args[0]) < 0) return message.channel.send({embed: embed1})
    // if (args[0] != "dm") return
    // let tf = (args[1] === 'yes') ? "true" : "false"
    if (client.optINOUT.get(message.author.id) === undefined) { // new person who never opted out before
        // optConfigInit = {
        //     funcs: args[0],
        //     value: tf
        // }
        optConfigInit = {
            value: [args[0]]
        }
        client.optINOUT.set(message.author.id, optConfigInit)
        message.reply(`Successfully opted out of ${args[0]}`)

    } else { //old person
        let modArray = client.optINOUT.get(message.author.id).value
        let newOptOldPerson = true;
        for (var i = 0; i < modArray.length; i++) {
            // console.log(modArray[i].indexOf(args[0]))
            if (modArray[i].indexOf(args[0]) > -1) { //found that segment of the config for that spec cmd, removing
                modArray.splice(i,1) //delete that optout. User is no longer opted out of that cmd
                // console.log(modArray)
                newOptOldPerson = false;
                message.reply(`Successfully removed optout out of ${args[0]}`)
                break;
            } else {
                newOptOldPerson = true;
            }
        }
        if (newOptOldPerson) {         // old person but havent opted for that spec service yet, add to the lsit
            modArray.push(args[0])
            message.reply(`Successfully opted out of ${args[0]}`)
        }

        client.optINOUT.setProp(message.author.id, "value", modArray)
    }
    
    // console.log("IN SET" + client.optINOUT.get(message.author.id).value)
}