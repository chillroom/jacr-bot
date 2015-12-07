var log = require("jethro"),
	config = require("./config");

log.setUTC(true);

if (typeof config.slackToken === "undefined") {
	throw Error("Please set the SLACK_TOKEN evironment variable");
} else if (typeof config.slackUrl === "undefined") {
	throw Error("Please set the SLACK_URL evironment variable");
} else if (typeof config.origins === "undefined") {
	throw Error("Please set the SITE_ORIGINS environment variable");
} else if (typeof config.slackChannels === "undefined") {
	log("warning", "API", "No SLACK_CHANNELS var, ommiting from post");
	config.slackChannels = "";
} else if (typeof config.slackMessage === "undefined") {
	log("warning", "API", "No SLACK_MESSAGE var, ommiting from post");
	config.slackMessage = "";
} else if (typeof config.ipaddress === "undefined") {
	log("warning", "API", "No OPENSHIFT_NODEJS_IP var, using 127.0.0.1");
	config.ipaddress = "127.0.0.1";
} else if (typeof config.botName === "undefined") {
	throw Error("Please set the BOT_NAME evironment variable or add bot username to the config.js file");
} else if (typeof config.botPass === "undefined") {
	throw Error("Please set the BOT_PASS evironment variable or add bot password to the config.js file");
} else if (typeof config.roomURL === "undefined") {
	throw Error("Please set the ROOM_URL environment variable or add the room URL to the config.js file");
} else {
	require("./app/server");
	require("./app/bot");
}
