# db8bot
## db8bot aims to make academic journals/research, online debate, and digital learning accessible to all.

[Invite db8bot](https://discord.com/oauth2/authorize?client_id=689368779305779204&permissions=310647056497&scope=bot%20applications.commands) | [db8bot Website](https://db8bot.app)

**You must have the *Manage Server* or be the owner of the server in order to invite the bot. Please do not modify any of the pre-selected permissions provided in the above link.**

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdb8bot%2Fdb8bot.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdb8bot%2Fdb8bot?ref=badge_large) [![Discord Bots](https://top.gg/api/widget/689368779305779204.svg)](https://top.gg/bot/689368779305779204)

<!-- [![db8bot's Widget](https://api.botlist.space/widget/689368779305779204/5 "db8bot's Widget")](https://botlist.space/bot/689368779305779204?utm_source=bls&utm_medium=widget&utm_campaign=689368779305779204) -->

<!-- [![db8bot's Widget] (https://arcane-botcenter.xyz/api/widget/689368779305779204.svg) "db8bot's Widget")](https://arcane-botcenter.xyz/bot/689368779305779204) -->

<!-- [![MBL](https://mythicalbots.xyz/bot/689368779305779204/embed?q=dark/ )](https://mythicalbots.xyz/bot/689368779305779204) -->

<!-- [discord.js](https://discord.js.org/). -->
## Table of Contents
[Basic Usage](#basic-usage)\
[Features](#features)\
[Self Hosting & Building for Development](#self-hostingbuilding-for-development)\
[Contributors](#contributors)\
[Sponsors](#sponsors)\
[License](#license)\
[Privacy](#privacy)\
[Credits & Mentions](#credits)\
[Contact](#contact-me)

## Basic Usage

* db8bot uses slash commands!
  * Start a command by typing "/"
  * Here are a few to get you started:
    * "/help" - Shows a quick guide to get you started
    * "/commands" - Shows available commands
    * "/get" - Attempt to find an accessible version of an academic journal given a DOI or link to the paywalled article
    * "/getbook" - Attempt to find an accessible version of a book (non-fiction & fiction) given an ISBN or name.
    * "/startround" - Start a debate round tracked by db8bot.
  * Feel free to join [this support server](https://discord.gg/rEQc7C7) if additional help is needed!

## Features

This is not a command list. Some of the descriptions after the dash are not actually how you use that command. Use `-commands` in a server with db8bot to find db8bot's full command list.
  * Moderation: purge
  * Utility Commands - server info, user info, bot info 
  * General Chat Commands - quickly generate a server invite link, say as bot
  * Debate Commands - get research paper from Google Scholar/Semantic Scholar/arXiv/Sci-Hub, start then track a debate round, track current speech, end the tracked debate round, get judge's paradigm from Tabroom
  * Fun Commands :) - trump quotes, communism, capitalism, bataille & baudrillard themed quotes

## Self-Hosting/Building for Development

We do not recommend self-hosting db8bot. The application depends on numerous custom in-house APIs and services. For the best experience, please invite the [hosted version](https://discord.com/oauth2/authorize?client_id=689368779305779204&permissions=310647056497&scope=bot%20applications.commands) of db8bot to your server.

We only support hosting on Linux machines at this time. We plan on releasing an image on Docker Hub soon.

Please find instructions [here](https://github.com/db8bot/db8bot/wiki/Self-Hosting-&-Building-for-Development)

## Contributors

* *AirFusion45* - Original author
* *Extinction Inevitable#2404* - Capitalism command request
* *julianv#0044* - Improvements on `/say`
* [*ethamitc*](https://github.com/ethamitc) - Improvement on the formatting of readme.md

## Sponsors
db8bot is supported by the following sponsors. This project would not be possible without them. Thank you for your support!

* [The Open-Source Collective on Open Collective](https://opencollective.com/db8bot)
* [FOSSA Inc.](https://www.fossa.com/?utm_source=FOSSA&utm_medium=db8bot)

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
  * In order to track debates, the names of each debate round are stored in our database in the form of <server id><name of the round given by the user>. For each debate round, we also store information about which members in the server are debating (in the form of mentionable user objects), the judge (in the form of a user object), the name of the debate event (ex: Public Forum, Policy, Lincoln Douglas), and the name of the round given by the user.
    * All debate rounds are archived after they are ended in the same file structure.
  * We also store non-personally identifiable information about what commands our users have used. This includes: the time the command was used, the name of the command that was used, the name of the server (server IDs are not stored), and the username of the user that used the command (the 4 discriminator digits are not stored). This information is stored on Google Analytics. 
  * We also store Tabroom.com team codes, entry list URLs, user-specified notification channels, a list of users to notify & roles to notify if someone setup the `/`follow` command to follow a team during a specified tournament. 
  * In addition, by using db8bot, you give us permission to use your server name and the logos of any organization that your server name refers to in our marketing and advertising materials. We will ensure that your organization is represented truthfully. See [here](https://www.gfrlaw.com/what-we-do/insights/beyond-brand-x-using-another%E2%80%99s-trademark-your-own-advertising) for more legal information.

  ### Length of storage
  * Debate round information is stored until the user deletes it through `/endround` 

  ### Questions about the deletion of your data
  * Please join the help server or use the `/feedback` command.

## Credits
Here are credits for all the code I used that was from other repositories.
  * `/botinfo` command's uptime calculations code & general ideas/inspiration from Dank-Memer's Dank-Memer [here](https://github.com/Dank-Memer/Dank-Memer).
Majority of the bot structure from AnIdiotsGuide's Tutorial-Bot [here](https://github.com/AnIdiotsGuide/Tutorial-Bot).
  * `/get` media command (Deprecated) core from iamadamdev's bypass-paywalls-chrome [here](https://github.com/iamadamdev/bypass-paywalls-chrome/)

## Contact Me
Feel free to contact me if you find bugs, license issues, missing credits, etc.

  * Please contact me here:
    * Email: jim@db8bot.app
    * Discord: AirFusion#5112
