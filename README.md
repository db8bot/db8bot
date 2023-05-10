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


## Basic Usage

* The prefix of db8bot is `/`.
    * For general help, the support server & additional notes type `/help`.
    * For the full commands list, type `/commands`.
    * Each command is called using the prefix, in the following form: `/<command>` where <command> is the command. For example, to call the command ping, you would type `/ping`.
    * Feel free to join [this support server](https://discord.gg/rEQc7C7) if additional help is needed!

## Features

This is not a command list. Some of the descriptions after the dash are not actually how you use that command. Use `-commands` in a server with db8bot to find db8bot's full command list.
  * Moderation: purge
  * Utility Commands - server info, user info, bot info 
  * General Chat Commands - generate embed messages, quickly generate a server invite link, say, DM person in server as bot.
  * Debate Comands - get research paper from Google Scholar/ResearchGate/arXiv, start then track a debate round, track current speech, end the tracked debate round, coin flip, get judge's paradigm from Tabroom
  * Fun Commands :) - trump quotes, communism, capitalism, bataille & baudrillard themed quotes

## Self-Hosting/Build for Developement

We do not recommend self-hosting db8bot. The application depends on numerous custom in-house APIs and services. For the best experience, please invite the [hosted version](https://discord.com/oauth2/authorize?client_id=689368779305779204&permissions=310647056497&scope=bot%20applications.commands) of db8bot to your server.

A brief outline of the requirements for self-hosting is listed below. We assume you have a basic understanding of Node.js, npm and mongoDB.

We only support hosting on Linux machines at this time. We plan on releasing a docker image soon.

### Install & Dependencies
* Clone the master branch or download the source code from our latest release.
* Assuming Node.js (We recommend LTS) and NPM are installed, run `npm install` to install production dependencies. If you are planning to modify the code, run `npm install --save-dev` instead to install dev dependencies as well.

### Register with Discord Developers
* Head to the [Discord Developers Portal](https://discord.com/developers). Register a developer account, create a bot & grab your bot token, bot ID.


### Helper APIs & Services
* db8bot depends on several in-house APIs & services. Please head to [db8bot's GitHub page](https:/github.com/db8bot) for the following instructions.

#### Blaze API
> Blaze API handles high intensity work loads such as OCR, journal requests, web scraping, Tabroom.com inbound email processing. Please follow instructions [here](https://github.com/db8bot/blaze-api) to set this API up.

#### Blaze-Edge API
> Blaze Edge API handles book requests. This API runs on runs on Cloudflare's Workers platform to decrease latency. Please follow instructions [here](https://github.com/db8bot/blaze-api-edge) to set this API up.

#### Tabroom API

#### /follow Google Cloud Cloud Function (Lambda Function) & Tasks
For the `/follow` command, db8bot uses Google Tasks to schedule the execution of a Cloud Function that automatically unsubscribes db8bot's Tabroom.com 


### Database
- MongoDB


### Telemetry & Analytics
- Twilio Segment
- Google Analytics
- Sentry

### Secrets
* db8bot uses [Doppler](https://doppler.com) to manage secrets, including for local development. You should sign up there and create a project for db8bot.
* If you plan to develop on your machine, follow Doppler's documentation to configure your machine for development (this includes installing their CLI).
* If you are planning to host, generate an access token for the project you just created.
* Create the following fields in your Doppler project:
```txt


```

### Hosting Configurations
Please configure your firewall to allow incoming & outgoing http & https requests. Please also expose port 8081 for db8bot's built-in service to receive returned results from helper APIs.

### Instructions for POSIX Like Environment
  1. Open `example.env`, rename it to `prod.env` & fill out the fields.
  ```
  TOKEN=<DISCORD BOT TOKEN>
  OWNER=<BOT OWNER ID>
  OWNERTAG=<BOT OWNER DISCORD TAG (USERNAME + DISCRIMINATOR)>
  PREFIX=<PREFIX FOR CMDS THAT STILL USE THE MESSAGE INTENT>
  NAME=<NAME OF BOT>
  INVLINK=<BOT INVITE LINK>
  TEMPTOKEN=<TEMP DISCORD TOKEN FOR TESTING>
  BOTID=<BOT ID>
  TABAPIKEY=<TABROOM API KEY - SEE INSTRUCTIONS BELOW>
  MONGOURI=<MONGODB URI WITH USERNAME & PASSWORD FILLED IN>
  MONGOUSER=<MONGODB USERNAME>
  MONGOPASS=<MONGODB PASSWORD>
  TELEMETRYKEY=<GOOGLE ANALYTICS UA TRACKING CODE>
  IPINFOTOKEN=<TOKEN FROM ipinfo.io>
  ```
  2. Go to the unofficial tabroomAPI [here](https://github.com/AirFusion45/tabroomAPI). Download the main branch, fill out the `apiKeysExample.json` & rename it to `apiKeys.json`. Deploy this Express.js API on any VPS of your choice. The api key goes in the TABAPIKEY. The ip of the API goes in the `judgeinfo.js` file.

  3. Go to MongoDB, create a database deployment, then create a database in the deployment. Create 4 collections: `debateTracking`, `debateTrackingArchive`, `ipfsKeys`, `prodCommandConfig`. Fill out the missing fields in `prod.env`

  4. Go to Discord Developers, setup bot account & get token, etc.

  5. `npm install`

  6. `docker build . -t db8bot`

## Contributors

* *AirFusion45* - Original author
* *Extinction Inevitable#2404* - Capitalism command request
* *julianv#0044* - Improvements on `/say`
* [*ethamitc*](https://github.com/ethamitc) - Improvement on formatting of readme.md

## Sponsors
db8bot is supported by the following sponsors. This project would not be possible without them. Thank you for your support!

* The Open-Source Collective on Open Collective
* FOSSA Inc.

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
  * We also store non-personally identifiable information about what commands our users have used. This includes: the time the command was used, the name of the command that was used, the name of the server (server IDs are not stored), the username of the user that used the command (the 4 discriminator digits are not stored). This information and this information ONLY is stored on Google Analytics. 
  * In addition, by using db8bot, you give us permission to use your server name and the logos of any organization that your server name refers to in our marketing and advertising materials. We will ensure that your organization is represented truthfully. See [here](https://www.gfrlaw.com/what-we-do/insights/beyond-brand-x-using-another%E2%80%99s-trademark-your-own-advertising) for more legal information.

  ### Length of storage
  * Debate round information is stored until the user deletes it through `/endround` 

  ### Questions about the deletion of your data
  * Please join the help server or use the `/feedback` command.

## Credits
Here are credits for all the code I used that was from other repositories.
  * `/botinfo` command's uptime calculations code & general ideas/inspiration from Dank-Memer's Dank-Memer [here](https://github.com/Dank-Memer/Dank-Memer).
  * Majority of bot structure from AnIdiotsGuide's Tutorial-Bot [here](https://github.com/AnIdiotsGuide/Tutorial-Bot).
  * `/get` media command core from iamadamdev's bypass-paywalls-chrome [here](https://github.com/iamadamdev/bypass-paywalls-chrome/)

## Contact Me
Feel free to contact me if you find bugs, license issues, missing credits, etc.

  * Please contact me here:
    * Email: jim@db8bot.app
    * Discord: AirFusion#5112

## Note/Notes 
  When self-hosting db8bot, we recommend downloading the latest release under the releases tab. As that is the most stable version.