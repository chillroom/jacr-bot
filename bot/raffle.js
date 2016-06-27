// Copyright (c) Qais Patankar 2016 - MIT License
"use strict";

const r = require("rethinkdb");
const moment = require("moment");

var Raffle = {
	onAdvance: () => {},
	state: null,
	settings: null
};
var bot;

/* Logs a simple RethinkDB error */
function errLog(err, doc) {
	if (err) {
		bot.log("error", "RETHINK.RAFFLE", err);
		return true;
	}
	return false;
}

Raffle.init = function(receivedBot) {
	bot = receivedBot;

	// Add the command counter
	const event = require("./events/chat-message.js");
	event.AddCommand("raffle", onCommand);

	Raffle.reload();
};

// TODO: Don't update the entire state or all the settings!!
function onCommand(bot, data) {
	// ensure we're a moderator
	if (bot.ranks.indexOf(data.user.role) === -1) {
		return;
	}

	switch (data.params[0]) {
	default:
		bot.sendChat("@" + data.user.username + ": !raffle (enable|disable|start|stop|status)");
		break;
	case "enable":
		bot.sendChat("Raffle enabled");
		Raffle.setEnabled(true);
		break;
	case "disable":
		bot.sendChat("Raffle disabled");
		Raffle.setEnabled(false);
		break;
	case "start":
		Raffle.start(false); // quiet = false
		break;
	case "stop":
		Raffle.stop();
		break;
	case "status":
		var message = "Raffles: ";
		message += Raffle.status.enabled ? "enabled" : "disabled";
		message += ", ";
		message += Raffle.state.started ? "active" : "waiting";
		message += ", ";
		message += "next raffle in " + Raffle.status.songsLeft + " songs";
		bot.sendChat(message);
		break;
	}
}

// This is called when one piece of data has been loaded.
var informationReady = function() {
	if (Raffle.settings == null || Raffle.state == null) {
		// Not quite ready yet!
		return;
	}

	// // Does a raffle already exist?
	// if (Raffle.state.started === true) {
	// 	Raffle.start(true); // quiet = true
	// 	return;
	// }

	var nextRaffleTime = moment(Raffle.state.lastRaffleTime).add(15, "minutes");
	
	// If 15 minutes has passed since the last time
	if (nextRaffleTime.isBefore()) {
		// Raffle.start(false); // quiet = false
		return;
	}
};

// States should only be accessed by one bot at a time
function updateState() {
	r.table("settings").get("raffle.dubtrack")
		.update(Raffle.state).run(bot.rethink, errLog);
}

// Commits the local settings to database
function updateSettings(key) {
	if (key == null) {
		r.table("settings").get("raffle").update(Raffle.settings).run(bot.rethink, errLog);
	} else {
		r.table("settings").get("raffoe").update({[key]: Raffle.settings[key]}).run(bot.rethink, errLog);
	}
}

Raffle.setEnabled = function(b) {
	Raffle.settings.enabled = b;
	Raffle.state.started = false;
	updateSettings("enabled");
};

Raffle.start = function(quietMode) {
	if (!Raffle.settings.enabled) {
		return;
	}

	// Update the state
	Raffle.state.lastRaffleTime = new Date(); // now!

	// Commit the state to database
	updateState();
};

// updateInformation triggers information reloading
Raffle.reload = function() {
	// reset our settings and state objects
	Raffle.settings = null;
	Raffle.state = null;

	// get global settings
	r.table('settings').get("raffle").run(bot.rethink, function(err, doc) {
		if (err) {
			bot.log("error", "RETHINK", err);
			return;
		}

		Raffle.settings = doc;
		informationReady();
	});

	r.table('settings').get("raffle.dubtrack").run(bot.rethink, function(err, doc) {
		if (err) {
			bot.log("error", "RETHINK", err);
			return;
		}

		Raffle.state = doc;
		informationReady();
	});
};

module.exports = Raffle;
