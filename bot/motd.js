// Copyright (c) Qais Patankar 2016 - MIT License
"use strict";

const r = require("rethinkdb");
const moment = require("moment");

var MOTD = {
	onAdvance: () => {},
	messageCount: 0
};
var bot;

/* Logs a simple RethinkDB error */
function errLog(err) {
	if (err) {
		bot.log("error", "RETHINK", err);
		return true;
	}
	return false;
}

MOTD.init = function(receivedBot) {
	bot = receivedBot;

	// Add the command counter
	const event = require("./events/chat-message.js");
	event.AddCommand("motd", onCommand);

	MOTD.reload();
};

MOTD.onChat = function() {
	MOTD.messageCount += 1;

	if (MOTD.messageCount > MOTD.settings.interval) {
		sendMOTD();
	}
};

// TODO: Only update individual field!
MOTD.setEnabled = function(b) {
	MOTD.settings.enabled = b;
	updateSettings();
};

// TODO: Don't update the entire state or all the settings!!
function onCommand(bot, data) {
	// ensure we're a moderator
	if (bot.ranks.indexOf(data.user.role) === -1) {
		return;
	}

	switch (data.params[0]) {
	default:
		bot.sendChat("@" + data.user.username + ": !motd (enable|disable|clear|add TEXT|interval X|status|list|reload|del X|show X)");
		break;
	case "enable":
		bot.sendChat("MOTD enabled");
		MOTD.setEnabled(true);
		break;
	case "disable":
		bot.sendChat("MOTD disabled");
		MOTD.setEnabled(false);
		break;
	case "clear":
		bot.sendChat("MOTD cleared");
		MOTD.settings.messages = [];
		MOTD.settings.enabled = false;
		updateSettings();
		break;
	case "add":
		bot.sendChat("MOTD added");
		MOTD.settings.messages.push(data.params.slice(1).join(" "));
		updateSettings();
		break;
	case "interval":
		var interval = parseInt(data.params[1], 10);
		if (isNaN(interval)) {
			bot.sendChat("Could not update MOTD interval");
			return;
		}
		bot.sendChat("Updated MOTD interval to " + interval);
		MOTD.settings.interval = interval;
		updateSettings();
		break;
	case "status":
		var message = "";
		message += "There are " + MOTD.settings.messages.length + " messages. ";
		message += "Enable state: " + MOTD.settings.enabled + ". ";
		message += "Interval: " + MOTD.settings.interval + ". ";
		message += "Next message: " + MOTD.state.nextMessage + ". ";
		message += "Last announce: " + MOTD.state.lastAnnounceTime + ". ";
		bot.sendChat(message);
		break;
	case "list":
		var listMessage = "MOTD messages: ||||";
		listMessage += MOTD.settings.messages.join("    ||||     ");
		bot.sendChat(listMessage);
		break;
	case "reload":
		bot.sendChat("MOTD reloading...");
		MOTD.reload();
		break;
	case "del":
		var delItem = parseInt(data.params[1], 10) - 1;
		if (isNaN(delItem) || MOTD.settings.messages[delItem] == null) {
			bot.sendChat("Could not find MOTD");
			return;
		}
		bot.sendChat("Deleting MOTD \"" + MOTD.settings.messages[delItem] + "\"");
		MOTD.settings.messages.splice(delItem, 1);
		updateSettings();
		break;
	case "show":
		var showItem = parseInt(data.params[1], 10) - 1;
		if (isNaN(showItem) || MOTD.settings.messages[showItem] == null) {
			bot.sendChat("Could not find MOTD");
			return;
		}
		bot.sendChat("MOTD: \"" + MOTD.settings.messages[showItem] + "\"");
		break;
	}
}

// This is called when one piece of data has been loaded.
var informationReady = function() {
	if (MOTD.settings == null || MOTD.state == null) {
		// Not quite ready yet!
		return;
	}

	// If 15 minutes has passed since the last announce time
	if (moment(MOTD.state.lastAnnounceTime).add(15, "minutes").isBefore()) {
		sendMOTD();
		return;
	}
};

// States should only be accessed by one bot at a time
function updateState() {
	r.table("settings").get("motd.dubtrack")
		.update(MOTD.state).run(bot.rethink, errLog);
}

// Commits the local settings to database
function updateSettings(key) {
	if (key == null) {
		r.table("settings").get("motd").update(MOTD.settings).run(bot.rethink, errLog);
	} else {
		r.table("settings").get("motd").update({[key]: MOTD.settings[key]}).run(bot.rethink, errLog);
	}
}

function sendMOTD() {
	if (!MOTD.settings.enabled) {
		return;
	}

	MOTD.messageCount = 0; // Reset messages counter
	var currentMessage = MOTD.settings.messages[MOTD.state.nextMessage];

	// Check if a currentMessage exists
	if (currentMessage == null) {
		// Let's try to send the first message. Let's check
		// if there are any messages at all before we do anything.
		if (MOTD.settings.messages.length === 0) {
			// TODO: Turn off MOTD
			console.log("Tried broadcasting message without any messages");
			MOTD.setEnabled(false);
			return;
		}

		// If we have message, set the nextMessage to 0, and retry.
		MOTD.state.nextMessage = 0;
		sendMOTD();
		return;
	}

	// Awesome. Now let's just send the message!
	bot.sendChat(currentMessage);

	// Update the state
	MOTD.state.lastAnnounceTime = new Date(); // now!
	MOTD.state.nextMessage += 1; // Increment the nextMessage counter

	// Commit the state to database
	updateState();
}

// updateInformation triggers information reloading
MOTD.reload = function() {
	// reset our settings and state objects
	MOTD.settings = null;
	MOTD.state = null;

	// get global settings
	r.table('settings').get("motd").run(bot.rethink, function(err, doc) {
		if (err) {
			bot.log("error", "RETHINK", err);
			return;
		}

		MOTD.settings = doc;
		informationReady();
	});

	r.table('settings').get("motd.dubtrack").run(bot.rethink, function(err, doc) {
		if (err) {
			bot.log("error", "RETHINK", err);
			return;
		}

		MOTD.state = doc;
		informationReady();
	});
};

module.exports = MOTD;
