# DB8Bot
DB8Bot or db8bot is a high school/college debate discord bot made using [discord.js](https://discord.js.org/).

# Self Hosting DB8Bot
You can host db8bot on a raspberry pi, or web hosting services like AWS or Heroku. For this guide, I am only going to go over hosting on a raspberry pi/computer.

  * __**Prerequisites:**__
    * A computer that has command prompt, or terminal access.
    * A computer that has node installed on it, and the ability to install npm modules.
    * Know the basics of how to add a Discord Bot to servers, setup & get tokens, etc.
    
  * __**Instructions:**__ (This guide only works on windows. Read the 8th bullet point for more details.)
    * Download the db8bot code from Github in a zip, and unzip it.
    * Head over to Discord's Developer Page [here](https://discordapp.com/developers/applications/me) to register a bot. 
    * After registering a bot, grab the bot's token. This will be used in the next step when the config needs to be filled in. A Discord Bot token should look like this: `MzgxPDyNotARealTokenTk0.DhPVkg.ThisIsNotRealnDzjK_rgdOJe4`. (<------- This is not a real token.)
    * View config(example).json, then create a config.json with all the missing information filled in.
    * Make sure that the newly created config.json is in the folder (same directory) where the config (example).json is.
    * Open up a command prompt or terminal, and go to the folder where all the files are (cd <file location>)
    * Follow the install instructions for sqlite & enmap [here](https://enmap.evie.dev/install). Make sure to read the "Pre-Requisites" section!
    * Then run the command `npm install` to install remaining dependencies. 
    * Next, use the Discord Permissions Calculator [here](https://discordapi.com/permissions.html#2146958591) to make your bot's invite link. The link provided already has the required permissions pre-checked. If you choose not to use the pre-checked link, the bot must have "ADMINISTRATOR" permissions to function. At the bottom of the page, place in your bot's client ID, which is found on your Discord Developers page.
    * Then, copy the link at the bottom of the page. That is your bot's invite link, anyone who has that link and have the "Manage Server" permission or is the server owner of a server can invite your bot to their server. 
    * To invite the bot to a server, paste the link into your browser, and select the server that you want to add the bot to. Make sure all the required permissions are checked and click "Authorize".
    * You are all set, head to your server and check the bot out!

# Adding DB8Bot To Your Discord Server
You can also just add db8bot to your existing server. DB8Bot has been already hosted for you in this option.

  * __**Prerequisites:**__
    * You need to have the "Manage Server" permission of the server __**OR**__ Be the owner of the server.
    * When adding db8bot, make sure that the bot has "ADMINISTRATOR" permissions on your server.
    * A link is provided [here](https://discordapp.com/oauth2/authorize?client_id=689368779305779204&scope=bot&permissions=2146958847) with all of the required permissions pre-selected.
   
  * __**Basic Operations Guide**__
    * The prefix of db8bot is `-`.
    * For general help, the support server & additional notes type `-help`.
    * For the full commands list, type `-commands`.
    * Each command is called using the prefix, in the following form: `-<command>` where <command> is the command. For example, to call the command ping, you would type `-ping`.
    * To check if db8bot has the correct permissions, just type `-checklist`. If `db8bot ADMINISTRATOR Permissions:` says `true` then db8bot has the required permissions to function.
    * Feel free to join [this support server](https://discord.gg/rEQc7C7) if additional help is needed!

# db8bot Features
This is not a command list. Some of the descriptions after the dash are not actually how you use that command. Use `-commands` in a server with db8bot to find db8bot's full command list.
  * Moderation:
    * Admin/Mod Commands - mute
    * Chat Management - purge & lockdown
  * Utility Commands - server info, user info, bot info 
  * General Chat Commands - generate embed messages, quickly generate a server invite link, say
  * Debate Comands - get research paper from sci-hub, start then track a debate round, track a new speech, end the tracked debate round, coin flip, get judge's paradigm from Tabroom
  * Fun Commands :) - trump quotes, communism & capitalism themed quotes

# Authors
  * AirFusion45 - Owner

# Contributors 
    * Extinction Inevitable#2404 - Capitalism command request
    * julianv#0044 - Improvements on -say

# License 
This Project is licensed under MIT License - see the LICENSE.md file for more details. The main points of the MIT License are:
  
  * This code can be used commercially
  * This code can be modified
  * This code can be distributed
  * This code can be used for private use
  * This code has no Liability
  * This code has no Warranty
  * When using this code, credit must be given to the author
  
# Credits
Here are credits for all the code I used that was from other repositories.
  * -botinfo command's uptime calculations code & general ideas/inspiration from Dank-Memer's Dank-Memer [here](https://github.com/Dank-Memer/Dank-Memer).
  * Majority of bot structure from AnIdiotsGuide's Tutorial-Bot [here](https://github.com/AnIdiotsGuide/Tutorial-Bot).

# Contact Me
Feel free to contact me if you find bugs, license issues, missing credits, etc.

  * Please contact me here:
    * Email: jfang.cv.ca.us@gmail.com OR jim@jimfang.me
    * Discord: AirFusion#1706

# Note/Notes 
  When self-hosting db8bot, we recommend downloading the latest release under the releases tab. As that is the most stable version.