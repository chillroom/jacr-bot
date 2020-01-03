# jacr-bot
Dubtrack bot for [Just A Chill Room](http://just-a-chill-room.net). This is licensed under the GNU GPL v3, except where otherwise stated.

# [Click here](https://github.com/chillroom/jacr-bot/issues/new) to create a new issue.
You need a GitHub account for this.

# Getting started
1. See config.js for a list of environment variables required to be INIT'd. You may edit this file directly.
2. `node bot/index.js` to start the dubtrack bot.
3. You need Go installed for Lastfm to work (bot will crash without the "lastfm" binary). Build bot/events/lastfm.go to the same directory. Currently hardcoded for qaisjp's system.

## Discord integration

```
https://discordapp.com/oauth2/authorize?client_id=<client-id>&scope=bot&permissions=0x20000000
```
