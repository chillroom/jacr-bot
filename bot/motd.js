// Copyright (c) Qais Patankar 2016 - MIT License

const moment = require("moment");
const db = require("./lib/db");

const MOTD = {
	onAdvance: () => {},
	messageCount: 0,
	messages: [],
};
let bot;

MOTD.init = (receivedBot) => {
	bot = receivedBot;

	// Add the command counter
	const event = require("./events/chat-message.js");
	event.AddCommand("motd", onCommand);
	event.AddHandler("motd", MOTD.onChat);

	MOTD.reload();
};

MOTD.onChat = function() {
	MOTD.messageCount += 1;

	if (MOTD.messageCount > MOTD.settings.Interval) {
		sendMOTD();
	}
};

// TODO: Only update individual field!
MOTD.setEnabled = function(b, announce) {
	MOTD.settings.Enabled = b;

	if (announce) {
		bot.sendChat(`MOTD has been ${b ? 'enabled' : 'disabled'}.`);
	}
};

MOTD.clearMessages = (successMessage) => {
	MOTD.messages = [];
	MOTD.settings.Enabled = false;

	db.query("TRUNCATE TABLE public.notices RESTART IDENTITY RESTRICT;", [], (err, _) => {
		if (bot.checkError(err, "pgsql", 'could not truncate notices table / clear messages')) {
			return;
		}

		updateSettings(successMessage);
	});
}

// TODO: Don't update the entire state or all the settings!!
function onCommand(bot, data) {
	// ensure we're a moderator
	if (bot.ranks.indexOf(data.user.role) === -1) {
		return;
	}
	
	bot.moderateDeleteChat(data.id);

	// If you edit this data.params[0], also edit 'enabled'/'disable' code below.
	switch (data.params[0]) {
	default:
		bot.sendChat(`@${data.user.username}: !motd (enable|disable|clear|add TEXT|interval X|status|list|reload|del X|show X)`);
		break;
	case "enable":
	case "disable":
		MOTD.setEnabled(data.params[0] === 'enable');
		break;
	case "interval":
		var interval = parseInt(data.params[1], 10);
		if (isNaN(interval)) {
			bot.sendChat("Could not update MOTD interval");
			return;
		}
		MOTD.settings.Interval = interval;
		updateSettings();
		break;
	case "status":
		bot.sendChat(`There are ${MOTD.messages.length} messages. MOTD is ${MOTD.settings.Enabled ? '' : 'not '}enabled. Interval: ${MOTD.settings.Interval}. Next message: ${MOTD.settings.NextMessage}. Last announce: ${MOTD.settings.LastAnnounceTime}.`);
		break;
	case "list":
		bot.sendChat("Please see https://api.just-a-chill-room.net/motd/list?mode=pretty");
		break;
	case "reload":
		MOTD.reload();
		break;
	}
}

// Commits the local settings to database
function updateSettings(successMessage) {
	const js = JSON.stringify(MOTD.settings);

	db.query("INSERT INTO settings(name, value) VALUES ('motd', $1) ON CONFLICT(name) DO UPDATE SET value = $1;", [js], (err, res) => {
		if (bot.checkError(err, "pgsql", 'could not update settings')) {
			return;
		}

		if (successMessage != null) {
			bot.sendChat(successMessage);
		}
	});
}

function sendMOTD() {
	if (!MOTD.settings.Enabled) {
		return;
	}

	MOTD.messageCount = 0; // Reset messages counter
	var currentMessage = MOTD.messages[MOTD.settings.NextMessage];

	// Check if a currentMessage exists
	if (currentMessage == null) {
		// Let's try to send the first message. Let's check
		// if there are any messages at all before we do anything.
		if (MOTD.messages.length === 0) {
			console.log("Tried broadcasting message without any messages");
			MOTD.setEnabled(false);
			return;
		}

		// If we have message, set the nextMessage to 0, and retry.
		MOTD.settings.NextMessage = 0;
		sendMOTD();
		return;
	}

	// Awesome. Now let's just send the message!
	bot.sendChat(currentMessage.message);

	// Update the state
	MOTD.settings.LastAnnounceTime = new Date(); // now!
	MOTD.settings.NextMessage += 1; // Increment the nextMessage counter

	// Commit the state to database
	updateSettings();
}

MOTD.validate = () => {
	if (MOTD.settings == null) {
		MOTD.settings = {};
	}

	if (MOTD.settings.Enabled !== true && MOTD.settings.Enabled !== false) {
		MOTD.settings.Enabled = false;
	}

	// TODO continue
};

// updateInformation triggers information reloading
MOTD.reload = () => {
	// reset our settings and state objects
	MOTD.settings = null;
	MOTD.messages = [];

	db.query("SELECT * FROM notices; SELECT * FROM settings WHERE name = 'motd'", [], (err, res) => {
		if (bot.checkError(err, "pgsql", 'could not receive notices')) {
			return;
		}

		for (const row of res.rows) {
			// If settings
			if (row.name === 'motd') {
				MOTD.settings = JSON.parse(row.value);
			} else {
				MOTD.messages.push(row);
			}
		}

		MOTD.validate();

		// If 15 minutes has passed since the last announce time
		if (moment(MOTD.settings.LastAnnounceTime).add(15, "minutes").isBefore()) {
			sendMOTD();
			return;
		}
	});
};

module.exports = MOTD;
