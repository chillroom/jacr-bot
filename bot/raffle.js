// Copyright (c) Qais Patankar 2016 - MIT License
"use strict";

const r = require("rethinkdb");
const moment = require("moment");

var Raffle = {
	onAdvance: () => {},
	state: null,
	settings: null,
	startingMessage: "@djs Type \"!join\" to join the raffle and have a chance to get moved to the front! Good luck.",

	warningTimer: null,
	finalTimer: null,
	nextTimer: null
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
	event.AddCommand("join", onJoinCommand);

	Raffle.reload();
};

Raffle.stop = function() {
	// Clean up our timers
	if (Raffle.warningTimer != null) {
		clearTimeout(Raffle.warningTimer);
		Raffle.warningTimer = null;
	}
	if (Raffle.finalTimer != null) {
		clearTimeout(Raffle.finalTimer);
		Raffle.finalTimer = null;
	}
	if (Raffle.nextTimer != null) {
		clearTimeout(Raffle.nextTimer);
		Raffle.nextTimer = null;
	}

	// Set our known states
	Raffle.state.users = [];
	Raffle.state.started = false;

	// Restart our timer
	// Our next raffle is in fifteen minutes!
	Raffle.nextTimer = setTimeout(Raffle.start, 1000 * 60 * 35);
	bot.log("info", "raffle", "The next raffle has been scheduled");

	// Commit the state
	updateState();
};

function onJoinCommand(bot, data) {
	if (!Raffle.state.started) {
		bot.sendChat("There isn't a raffle at this time!");
		return;
	}

	var presence = v => {
		return data.user.id.indexOf(v.uid) >= 0;
	};

	// Already entered?
	if (Raffle.state.users.some(presence)) {
		return bot.sendChat("@" + data.user.username + " you've already entered the raffle!");
	}
    
    // Not in queue?
	if (!bot.getQueue().some(presence)) {
		return bot.sendChat("@" + data.user.username + " you must be in the queue to enter the raffle!");
	}

	if (bot.getQueuePosition(data.user.id) === 0) {
		return bot.sendChat("@" + data.user.username + " you're already at #1!");
	}

	var entrant = {uid: data.user.id, username: data.user.username};
	Raffle.state.users.push(entrant);

	r.table("settings").get("raffle.dubtrack").update({
		users: r.row.getField("users").append(entrant)
	}).run(bot.rethink, errLog);

	bot.sendChat("@" + data.user.username + ", you have entered the raffle!");
}

// TODO: Don't update the entire state or all the settings!!
function onCommand(bot, data) {
	// ensure we're a moderator
	if (bot.ranks.indexOf(data.user.role) === -1) {
		return;
	}

	switch (data.params[0]) {
	case "help":
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
		if (Raffle.state.started) {
			bot.sendChat("Raffle is already started!");
			return;
		}

		Raffle.start(false, true); // quiet = false, force = true
		break;
	case "stop":
		Raffle.stop();
		break;
	case "status":
		var message = "Raffles: ";
		message += Raffle.settings.enabled ? "enabled" : "disabled";
		message += ", and ";
		message += Raffle.state.started ? "active" : "waiting";
		bot.sendChat(message);
		break;
	default:	
	}
}

// This is called when one piece of data has been loaded.
var informationReady = function() {
	if (Raffle.settings == null || Raffle.state == null) {
		// Not quite ready yet!
		return;
	}

	// Does a raffle already exist?
	if (Raffle.state.started === true) {
		bot.log("info", "raffle", "Starting a raffle (already started on boot)");
		Raffle.state.started = false; // explicitly circumvent over-starting prevention mechanism
		Raffle.start(true); // quiet = true
		return;
	}

	var nextRaffleTime = moment(Raffle.state.lastRaffleTime).add(35, "minutes");
	
	// If 35 minutes has passed since the last time
	if (nextRaffleTime.isBefore()) {
		bot.log("info", "raffle", "Starting a raffle in 10 seconds (35 minute boot threshold)");
		setTimeout(Raffle.start, 1000 * 10, false, false); // quiet = false, force = false
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
		r.table("settings").get("raffle").update({[key]: Raffle.settings[key]}).run(bot.rethink, errLog);
	}
}

Raffle.setEnabled = function(b) {
	Raffle.settings.enabled = b;
	Raffle.state.started = false;
	updateSettings("enabled");
};

Raffle.start = function(quietMode, force) {
	// Kill our next timer
	if (Raffle.nextTimer != null) {
		clearTimeout(Raffle.nextTimer);
		Raffle.nextTimer = null;
	}

	// No over-starting, even if forced.
	if (Raffle.state.started) {
		bot.log("warn", "raffle", "Overstarting has been blocked");
		return;
	}

	// unless force....
	if (!force) {
		// make sure we're enabled
		if (!Raffle.settings.enabled) {
			return;
		}

		// and we have enough people
		if (bot.getQueue().length < 5) {
			bot.log("info", "raffle", "Postponing raffle (not enough people) (5 people needed, have " + bot.getQueue().length + " people)");
			Raffle.nextTimer = setTimeout(Raffle.start, 1000 * 60 * 5); // try starting again in five minutes
			return;
		}
	}

	if (!quietMode) {
		bot.sendChat(Raffle.startingMessage);
	}

	// Update the state
	Raffle.state.lastRaffleTime = new Date(); // now!
	Raffle.state.started = true;

	// Start our timer
	Raffle.warningTimer = setTimeout(warningTimerCallback, 1000 * 100); // 100 seconds = 1 minutes 40 seconds

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

function warningTimerCallback() {
	// Clean up our timer
	Raffle.warningTimer = null;

	var numberEntered = Raffle.state.users.length;
	bot.sendChat("The raffle expires in 20 seconds, " + numberEntered + " user" + (numberEntered === 1 ? " is" : "s are") + " participating! Hurry @djs and \"!join\"");

	Raffle.finalTimer = setTimeout(finalTimerCallback, 1000 * 20, bot); // 20 seconds = 1000 milliseconds (1 second)
}

function finalTimerCallback() {
	// Clean up our timer
	Raffle.finalTimer = null;

	var users = Raffle.state.users;
	// Nobody joined the raffle?!
	if (users.length === 0) {
		bot.sendChat("No one entered the raffle! Be sure to pay attention for the next one!");
		Raffle.stop();
		return;
	}
	
	// Decide a random winner
	var randomWinner = users[Math.floor(Math.random() * users.length)];

	// Move the random winner to the second-front
	if (bot.getQueuePosition(randomWinner.uid) > 0) {
		bot.moderateMoveDJ(randomWinner.uid, 1);
	}
	
	// Announce the winner
	if (users.length === 1) {
		bot.sendChat("The raffle has ended! 1 user participated and our \"lucky\" winner is: @" + randomWinner.username + "!");
	} else {
		bot.sendChat("The raffle has ended! " + users.length + " users participated and our lucky winner is: @" + randomWinner.username + "!");
	}

	// Clean up
	Raffle.stop();
}

module.exports = Raffle;
