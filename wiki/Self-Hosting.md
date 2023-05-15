# Self-Hosting/Building for Development
An outline of the requirements for self-hosting is listed below. We assume you have a basic understanding of Node.js, npm, and MongoDB.

## Install & Dependencies
* Clone the master branch or download the source code from our latest release.
* Assuming Node.js (We recommend LTS) and NPM are installed, run `npm install` to install production dependencies. If you are planning to modify the code, run `npm install --save-dev` instead to install dev dependencies as well.

## Register with Discord Developers
* Head to the [Discord Developers Portal](https://discord.com/developers). Register a developer account, create a bot & grab your bot token and bot ID.
* While you are on the Discord Developers site, assemble your invite link. You can use either the URL generator under the OAuth2 tab or using the following template:
```
https://discord.com/oauth2/authorize?client_id={INSERT CLIENT ID}&permissions=310647056497&scope=bot%20applications.commands
```
If you use the URL generator, ensure the following boxes are checked:
  * Scope:
    * bot
    * applications.commands
  * Bot Permissions:
    * Manage Server
    * Manage Roles
    * Manage Channels
    * Create Invites
    * Change Nickname
    * Manage Emoji & Stickers
    * Send Messages
    * Send Messages in Threads
    * Create Public Threads
    * Manage Messages
    * Embed Links
    * Attach Files
    * Read Message History
    * Add Reactions

Selecting these permissions should result in the same permissions sum & scope string. 

## Helper APIs & Services
db8bot depends on several in-house APIs & services. Please head to [db8bot's GitHub page](https:/github.com/db8bot) for the following instructions.

### Blaze API
Blaze API handles high-intensity work loads such as OCR, journal requests, web scraping, Tabroom.com inbound email processing. Please follow the instructions [here](https://github.com/db8bot/blaze-api) to set this API up.

### Blaze-Edge API
Blaze Edge API handles book requests. This API runs on runs on Cloudflare's Workers platform to decrease latency. Please follow the instructions [here](https://github.com/db8bot/blaze-api-edge) to set this API up.

### Tabroom API & Tabroom Bot Account
Tabroom API is a custom web scraping API to interact with Tabroom.com, the largest and main tabulation site used for high school and collegiate competitive debate. Please follow the instructions [here](https://github.com/db8bot/Tabroom-API) to set this API up.

For the `/follow` feature to work, we've also set up a Tabroom.com account just for db8bot. We did this by setting up an email through Twilio Sendgrid and then using that email address to signup for a Tabroom account. You can use any email service you want (Mailgun, Sendinblue, etc.)

You might need to write some quick code to dump incoming email bodies into the console to grab the verification code.

### /follow Google Cloud Cloud Function (Lambda Function) & Tasks
For the `/follow` command, db8bot uses Google Tasks to schedule the execution of a Cloud Function that automatically unfollows a team on Tabroom.com, so db8bot stop receiving competition pairing emails about a team when no longer needed.

This part requires you to set up some infrastructure on Google Cloud (The rest of your app can still run on any VPS, though). 
* Signup for Google Cloud and create a project.
* Enable the Cloud Tasks API and set up your IAM to have a service account scoped to add and modify tasks.
* Open `/commands/follow.js` and find the `createCloudTasks()` function. Edit the constants to match your Cloud tasks configuration. [**TODO** Turn these into env vars]

## Database
We use MongoDB Atlas. Please create an account and set up an instance there.

For database structure:
```js
[Database] db8bot
    |
    |_ [Collection] debateTracking
    |
    |_ [Collection] debateTrackingArchive
    |
    |_ [Collection] ipfsKeys // deprecated since v5 & optional
    |
    |_ [Collection] prodCommandConfig // deprecated since v5 & optional
    |
    |_ [Collection] tabroomLiveUpdates
```
Grab your database user login & password. Assemble the URI as well. They will be useful later in the secrets section.

## Telemetry & Analytics
### Twilio Segment
We use Twilio Segment to ingest data into Google Analytics. Set up an account and add a source from Node.js to Google Analytics under the connections tab. Feel free to customize the mapping, but we have it setup like the following for the hosted production version:

When `Event Type` _is_ `Page`
```
Node.js -> Google Analytics 4
-----------------------------
projectId -> Client ID
userId -> User ID
timestamp -> Event Timestamp
properties.path -> Page Location
properties.referer -> Page Referer
name -> Page Title
1 -> Engagement Time in Miliseconds
```

### Google Analytics
The data from Twilio Segment feeds into Google Analytics according to the mapping above. However, feel free to set this up however you like to provide you the most useful telemetry.

### Sentry
[**TODO** Add Sentry back!]
We use Sentry to track errors in production. Register at [sentry.io](https://sentry.io) and grab your DSN. This will go in the secrets file later on. 

## Secrets
* db8bot uses [Doppler](https://doppler.com) to manage secrets, including for local development. You should sign up there and create a project for db8bot.
* If you plan to develop on your machine, follow Doppler's documentation to configure your machine for development (this includes installing their CLI).
* If you are planning to host, generate an access token for the project you just created.
* Create the following fields in your Doppler project:

```env
BLAZEAUTH=Blaze API Auth Key
BLAZEDGEURL=Blaze Edge API Cloudflare Workers endpoint URL
BLAZEURL=Blaze API endpoint URL
BOTEXPRESSAUTH=API Key for db8bot's HTTP server to receive requests from microservices
BOTID=Discord Bot ID
BUILD=Build Name
GCLOUDCFSERVICE=Google Cloud Tasks service account credentials (JSON)
INVLINK=Discord Bot invite link
IPINFOTOKEN=IP Info service API Token (deprecated & optional)
MONGOPASS=MongoDB database password
MONGOURI=MongoDB database URI - Including username & password
MONGOUSER=MongoDB database username
NAME=Discord Bot tag (name + discrim)
OWNER=Discord Bot owner's Discord account ID
OWNERTAG=Discord Bot owner's Discord account tag (name + discrim)
PREFIX=Bot prefix before slash commands (deprecated & optional)
SCIHUBREDISPASSWORD=Scihub redis cache URL (deprecated & optional)
SCIHUBREDISURL=Scihub redis URL (deprecated & optional)
TABAPIKEY=Tabroom API Auth Key
TABPASSWORD=Bot's Tabroom account password
TABURL=Tabroom API endpoint URL
TABUSERNAME=Bot's Tabroom account username/email
TELEMETRYKEY=Twilio Segment API Key
TEMPTOKEN=Storage spot for dev instance Discord token
TOKEN=Discord bot token
```

**Stop here if you plan on just running db8bot locally for development.**

### CI/CD
We use [CircleCI](https://circleci.com/) for CI/CD. Our workflow is defined in `.circleci/config.yml`. It is set up to deploy on our Google Cloud Compute instance. You will need to modify the service accounts from `circleci-docker-build@db8bot.iam.gserviceaccount.com` to a service account that can update compute instances. You would also need to modify container tags such as `us-central1-docker.pkg.dev/db8bot`

You should have two secrets directly assigned to the CI build server:
```env
DOPPLER_TOKEN=Production access token from Doppler
GCLOUD_SERVICE_KEY=Service key for the service account 
```

## Hosting Configurations
### Firewall
Please configure your firewall to allow incoming & outgoing http & https requests. Please also expose port 8081 for db8bot's built-in service to receive returned results from helper APIs.
### Static IPs
db8bot ideally should be hosted with a static outfacing IP to ensure that db8bot's API (receiving requests) is not affected by a server restart.