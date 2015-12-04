#BETA BOT#

[![Build Status](https://jenkins-nitroghost.rhcloud.com/buildStatus/icon?job=betabot-build)](https://jenkins-nitroghost.rhcloud.com/job/betabot-build/)
[![Join the JACR Community on Slack](https://betabot-nitroghost.rhcloud.com/badge.svg)](http://justachillroom.slack.com)

The best freaking [dubtrack.fm](https://dubtrack.fm) bot in the world.

#INSTALLATION AND RUNNING#

1) `git pull` to get the latest code, or `git clone git@bitbucket.org:dubbot/betabot.git` if you haven't already

2) Setup your config.mine.js file. example:
```js
module.exports = {
	botName: "nitrowhore",
	botPass: "isACuntLOL", //not my actual password so don't even try it :P
	roomURL: "nitrowhore" //use what ever URL you have a test room for (the part after /join/ on dubtrack)
};
```
3) Run the bot with `npm test`. This will `npm install` dependencies if any has been added, run `gulp mine` which copies your config.mine.js file to config.js then `node ./app/bot/index.js` to start the bot

4) Make your changes to the code

5) Run `npm run lint` to lint your code. You will most likely get warnings about "no-unused-vars" as well as "indent" warnings. You can ignore these warnings. If you get any linting errors **make sure** you go and fix them to ensure code quality control. I have added --fix parameter to this command to try and fix what it can for you (you should have seen the amount of errors when I ran it for the first time D: Over 1,000 errors. Then I found the --fix command and it brought them down to around 40)

6) If you have npm version 2.13 or greater (you can check this in the console with `npm -v`) you can run the following code to make a commit: `npm version patch -fm "commit message"`. What this does is it first runs `gulp config` which sets the config.js to that of the config.bot.js, runs `git add --all` which adds all your changes git (the `--all` tag ensures deleted files are also recorded), increments the package.json version, then commits to git your changes before before `git push`ing to bitbucket

>If you do not have npm version 2.13 or greater, you can use the following tool to upgrade your npm [npm-windows-upgrade](https://github.com/felixrieseberg/npm-windows-upgrade) (assuming you're on windows. If linux, well, [google](https://google.com) is your friend)

6) If you are too lazy to upgrade your npm version, you will **have to** increment the version in package.json then run the following commands yourself:
```bash
gulp config #copies config.bot.js to config.js ready for the bot
git add --all #add all changes to git (including recording deletes)
git commit -m "commit message"
git push
```
>I bet you wish you upgraded your npm version now huh?

#BUILD FAILURES#

These are what currently results in build failures:

* Errors in the linting process - Run `npm run lint` on your own machine to find out what are the errors and fix them.
* ./test tests fail during the build process results in a failure
What doesn't result in a build failure:
* Any code failures that are invoked through commands - If this happens you will notice that the bot runs away, then returns moments later. Check your code if you see the bot do this
* MongoDB decides that it doesn't want you to connect. This shouldn't result in a bot failure, but Nitro Ghost will be able to see these in the logs. It may be just a case of a couple of commands that rely on the database to work. The bot should be trying to auto reconnect to the database if the database drops out for whatever reason

#TO CONSIDER#

There are multiple folders and files contained within the repo that **should not be touched**. These are as follows:

* app.js - this file is used to check to see if the environment variables have been checked, then starts up the slack server API as well as the bot. You could run this file *if* you wanted, but you will need to add the other variables to your config.mine.js file. It's best to just run the bot with `npm test`.
* config.bot.js - If you make changes to this, the bot will not work as the variables are set on the system it runs on. You will notice that this file contains some extra variables that are not incuded in config.mine.js. These are variables to setup the slack API server as well as two openshift variables that sets the IP and port to run it on.
* .eslintrc.json - This file is to setup eslint. I have relaxed a couple of rules ("no-unused-vars" as well as "indent") 
* ./.openshift - This is a folder used by openshift to setup the bot. You'll see that this contains a few subfolders. The main one is markers which contains a file called "hot_deploy". This allows the bot to update its code without actually shutting down the process that's running it.
* ./test - This folder contains files that test the code to make sure everything is running correctly. Currently there is only slack-api.js file in this folder which checks to make sure the Slack API server is working as it should during the Jenkins build process. If it's not, it will stop the build process and results in a failure. (you can check back to this page to see the status of the build. They are: running, passing, and failing) If you was the last to push code and it says it's failing, go check your code for errors
* ./app/server - This folder contains all the code to run the slack API server. We do not want these files to break as it will kill both the API server as well as the bot, and no one will be happy

>Feel free to make changes to the gulp file to add your own scripts if you want to do some automated builds yourself or whatever, just **do not** edit/delete "config" or "mine".

If you're nosy, you probably noticed that there are a few extra scripts in the package.json file. Anything that starts with the prefix "ci-" are ran on the Jenkins build server to run the tests. Then they are the commands that contain the word "version" which is the scripts that are ran when you do `npm version patch -fm "commit message"` then finally the last script "start" is just a script Nitro Ghost runs to start app.js to get both the bot and the API server running because he's lazy.

If you have any questions, feel free to ask Nitro Ghost on slack, and I'm sure he will help (probs not before he winds you up first because it's just the way he is).