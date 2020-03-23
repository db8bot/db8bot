


exports.run = function (client, message, args) {
    function countdown(seconds) {
        // var seconds = 60;
        function tick() {
            // var counter = document.getElementById("counter");
            seconds--;
            // counter.innerHTML = "0:" + (seconds < 10 ? "0" : "") + String(seconds);
            if( seconds > 0 ) {
                setTimeout(tick, 1000);
            } else {
                message.channel.send("Speech time is over.")
            }
        }
        tick();
    }

    var guild = message.guild;
    var roundInfo = client.rounds.get(guild.id + args[0]);

    if (roundInfo.type.toLowerCase().indexOf("policy") != -1 || roundInfo.type.toLowerCase().indexOf("cx") != -1 || roundInfo.type.toLowerCase().indexOf("pol") != -1) {
        if (roundInfo.speech === "") {
            //1ac
            client.rounds.setProp(guild.id+args[0], "speech", "1ac")
            // console.log(client.rounds.getProp(guild.id + args[0], "speech"))
            message.reply(`1AC started! 8 minutes remaining.`)
            // countdown(480);
            countdown(120); //add name recognition so when time ends we know which round the timer belongs to
        } else if (roundInfo.speech === "1ac") {
            //cx1
            client.rounds.setProp(guild.id+args[0], "speech", "cx1")
            message.reply(`1st CX started! 3 minutes remaining.`)
            countdown(180);
        } else if (roundInfo.speech === "cx1") {
            //1nc
            client.rounds.setProp(guild.id+args[0], "speech", "1nc")
            message.reply(`1NC started! 8 minutes remaining.`)
        } else if (roundInfo.speech === "1nc") {
            //cx2
            message.reply(`2nd CX started! 3 minutes remaining.`)
            client.rounds.setProp(guild.id+args[0], "speech", "cx2")
        } else if (roundInfo.speech === "cx2") {
            //2ac
            client.rounds.setProp(guild.id+args[0], "speech", "2ac")
            message.reply(`2AC started! 8 minutes remaining.`)
        } else if (roundInfo.speech === "2ac") {
            //cx3
            message.reply(`3rd CX started! 3 minutes remaining.`)
            client.rounds.setProp(guild.id+args[0], "speech", "cx3")
        } else if (roundInfo.speech === "cx3") {
            //2nc
            client.rounds.setProp(guild.id+args[0], "speech", "2nc")
            message.reply(`2NC started! 8 minutes remaining.`)
        } else if (roundInfo.speech === "2nc") {
            //cx4
            client.rounds.setProp(guild.id+args[0], "speech", "cx4")
            message.reply(`4th CX started! 3 minutes remaining.`)
        } else if (roundInfo.speech === "cx4") {
            //1nr
            message.reply(`1NR started! 5 minutes remaining.`)
            client.rounds.setProp(guild.id+args[0], "speech", "1nr")
        } else if (roundInfo.speech === "1nr") {
            //1ar
            client.rounds.setProp(guild.id+args[0], "speech", "1ar")
            message.reply(`1AR started! 5 minutes remaining.`)
        } else if (roundInfo.speech === "1ar") {
            //2nr
            client.rounds.setProp(guild.id+args[0], "speech", "2nr")
            message.reply(`2NR started! 5 minutes remaining.`)
        } else if (roundInfo.speech === "2nr") {
            //2ar
            client.rounds.setProp(guild.id+args[0], "speech", "2ar")
            message.reply(`2AR started! 5 minutes remaining.`)
        }
    }

}