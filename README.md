# DB8Bot
DB8Bot or db8bot is a high school/college debate discord bot made using [discord.js](https://discord.js.org/).

[![db8bot's Widget](https://api.botlist.space/widget/689368779305779204/5 "db8bot's Widget")](https://botlist.space/bot/689368779305779204?utm_source=bls&utm_medium=widget&utm_campaign=689368779305779204)

<!-- [![db8bot's Widget] (https://arcane-botcenter.xyz/api/widget/689368779305779204.svg) "db8bot's Widget")](https://arcane-botcenter.xyz/bot/689368779305779204) -->

[![MBL](https://mythicalbots.xyz/bot/689368779305779204/embed?q=dark/ )](https://mythicalbots.xyz/bot/689368779305779204)

[![Discord Bots](https://top.gg/api/widget/689368779305779204.svg)](https://top.gg/bot/689368779305779204)


## Self Hosting DB8Bot
DB8Bot can be hosted on anything, from your personal computer, to a Raspberry Pi, or even cloud services such as Google Cloud, Amazon Web Services, or Heroku. Please refer to the appropriate guide below based on your operating system.

### Windows Installation
#### Prerequisites

* A computer running Microsoft Windows with Administrator access.
* A Discord Application with a bot account ([Create Here](https://discordapp.com/developers/applications/me))

#### Instructions

**1.** Make sure that Node.js is installed

You can find out if Node.js is installed by opening a terminal (CMD) window and type in `node -v`. If the terminal shows any kind of error, you likely don't have Node.js installed, you can download it [here](https://nodejs.org) (It is recommended to download the LTS version).

 **2.** Download DB8Bot source code

 You can download the source code either as a zip, or using the git command line tools (if installed).

**3.** Create configuration file

Copy the `config(example).json` file and rename it as `config.json`, then fill out all the appropriate details.

**4.** Install dependencies

Firstly, head over to [here](https://enmap.evie.dev/install) and follow the instructions to install `enmap` and `better-sqlite3`. Once you've done that, run `npm install` to install the remaining dependencies.

**5.** Create invite link

Use the Discord Permissions Calculator [here](https://discordapi.com/permissions.html#2146958591) to make your bot's invite link. The link provided already has the required permissions pre-checked. If you choose not to use the pre-checked link, the bot must have "MANAGE_SERVER" permissions to function. At the bottom of the page, place in your bot's client ID, which is found on your Discord Developers page.

Then, copy the link at the bottom of the page. That is your bot's invite link, anyone who has that link and have the "Manage Server" permission or is the server owner of a server can invite your bot to their server. 

To invite the bot to a server, paste the link into your browser, and select the server that you want to add the bot to. Make sure all the required permissions are checked and click "Authorize".

**6.** Start the bot

To start the bot, open a terminal (CMD) window and navigate to the folder where the bot's files are, then simply run `node index.js` and the bot should come online.

## Adding the official DB8Bot
Instead of self-hosting your own DB8Bot, you can invite the version hosted by *AirFusion45*.

**You must have the *Manage Server* or be the owner of the server in order to invite the bot.**

[Invite DB8Bot](https://discordapp.com/oauth2/authorize?client_id=689368779305779204&scope=bot&permissions=2146958847)

**Please do not modify any of the pre-selected permissions provided in the above link.**

## Basic Usage

* The prefix of db8bot is `-`.
    * For general help, the support server & additional notes type `-help`.
    * For the full commands list, type `-commands`.
    * Each command is called using the prefix, in the following form: `-<command>` where <command> is the command. For example, to call the command ping, you would type `-ping`.
    * Feel free to join [this support server](https://discord.gg/rEQc7C7) if additional help is needed!

## Features

This is not a command list. Some of the descriptions after the dash are not actually how you use that command. Use `-commands` in a server with db8bot to find db8bot's full command list.
  * Moderation:
    * Admin/Mod Commands - mute
    * Chat Management - purge & lockdown
  * Utility Commands - server info, user info, bot info 
  * General Chat Commands - generate embed messages, quickly generate a server invite link, say, DM person in server as bot.
  * Debate Comands - get research paper from sci-hub, start then track a debate round, track current speech, end the tracked debate round, coin flip, get judge's paradigm from Tabroom
  * Fun Commands :) - trump quotes, communism, capitalism, bataille & baudrillard themed quotes

## Contributors

* *AirFusion45* - Original Author
* *Extinction Inevitable#2404* - Capitalism command request
* *julianv#0044* - Improvements on -say
* [*ethamitc*](https://github.com/ethamitc) - Improvement on formatting of readme.md

## License 
This Project is licensed under MIT License - see the LICENSE.md file for more details. The main points of the MIT License are:
  
  * This code can be used commercially
  * This code can be modified
  * This code can be distributed
  * This code can be used for private use
  * This code has no Liability
  * This code has no Warranty
  * When using this code, credit must be given to the author

## Privacy

  ### The data we collect
  * In order to track debates, the names of each debate round are stored in our database in the form of <server id><name of the round given by the user>. For each debate round, we also store information about which members in the server are debating (in the form of mentionable user objects), the judge (in the form of a user object), the name of the debate event (ex: public forum, policy, Lincoln Douglas), and the name of the round given by the user.
  * We also store non-personally identifiable information about what commands our users have used. This includes: the time the command was used, the name of the command that was used, the name of the server (server IDs are not stored), the username of the user that used the command (the 4 discriminator digits are not stored).
  * We also store user IDs of users who have chosen to opt-out of specific functions and the name of the function(s) they have opted out of.

  ### Length of storage
  * Debate round & opt out information are stored until the user deletes them through `-endround` & `-optout` respectively 

  ### Questions about the deletion of your data
  * Please join the help server or use the `-feedback` command.

## Credits
Here are credits for all the code I used that was from other repositories.
  * -botinfo command's uptime calculations code & general ideas/inspiration from Dank-Memer's Dank-Memer [here](https://github.com/Dank-Memer/Dank-Memer).
  * Majority of bot structure from AnIdiotsGuide's Tutorial-Bot [here](https://github.com/AnIdiotsGuide/Tutorial-Bot).

## Contact Me
Feel free to contact me if you find bugs, license issues, missing credits, etc.

  * Please contact me here:
    * Email: jfang.cv.ca.us@gmail.com OR jim@jimfang.me
    * Discord: AirFusion#1706

## Note/Notes 
  When self-hosting db8bot, we recommend downloading the latest release under the releases tab. As that is the most stable version.
