The bot "jacr-bot" running on [Dubtrack](https://dubtrack.fm/join/just-a-chill-room) and the [API](https://api.just-a-chill-room.net).

# Getting started
1. See config.js for a list of environment variables required to be INIT'd. You may edit this file directly.
2. `node bot/index.js` to start the dubtrack bot.
3. You need Go installed for Lastfm to work (bot will crash without the "lastfm" binary). Build bot/events/lastfm.go to the same directory. Currently hardcoded for qaisjp's system.

# TO CONSIDER

There are multiple folders and files contained within the repo that **should not be touched**. These are as follows:

* app.js - this file is used to check to see if the environment variables have been checked, then starts up the slack server API as well as the bot. You could run this file *if* you wanted, but you will need to add the other variables to your config.mine.js file. It's best to just run the bot with `npm test`.
* config.js - basic config
* ./app/server - This folder contains all the code to run the slack API server. We do not want these files to break as it will kill both the API server as well as the bot, and no one will be happy