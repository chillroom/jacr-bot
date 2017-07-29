let bot;
const db = require('./lib/db');
const Raffle = require("./raffle.js");
const event = require('./events/chat-message.js');

const EventManager = {
	state: null,
};

// Commits the local settings to database
function validateDB(forceChange) {
	let changed = forceChange === true;

	if (EventManager.state == null) {
		EventManager.state = {};
		changed = true;
	}

	if (EventManager.state.started !== true && EventManager.state.started !== false) {
		EventManager.state.started = false;
		changed = true;
	}
	if (EventManager.state.last !== true && EventManager.state.last !== false) {
		EventManager.state.last = false;
		changed = true;
	}

	if (changed) {
		db.query(
			"INSERT INTO settings(name, value) VALUES('event', $1) ON CONFLICT(name) DO UPDATE SET value = $1",
			[JSON.stringify(EventManager.state)],
			bot.dbLog("Internal error. Could not insert verified settings for event.")
		);
	}
}

function endEvent() {
	EventManager.state.started = false;
	EventManager.state.last = false;
	bot.moderateLockQueue(false);
	bot.sendChat("The event is now over, thanks for coming! Make sure you check out our Facebook page for upcoming events: https://fb.me/justachillroom");
	Raffle.setEnabled(true);
	bot.motd.setEnabled(true);
	validateDB(true);
}

function start(data) {
	if (EventManager.state.started) {
		bot.sendChat("Event has already started!");
		return;
	}
	EventManager.state.started = true;

	bot.moderateLockQueue(true);

	let suffix = "Enjoy the event!";
	if (data.params[1] != null) {
		let username = data.params[1];
		if (username.substr(0, 1) === "@") {
			username = username.substr(1);
		}
		suffix = `Welcome @${username} to the room and enjoy the event!`;
	}
	bot.sendChat(`@everyone Our event is beginning and the queue is now locked. ${suffix}`);
	validateDB(true);
}


// TODO: Don't update the entire state or all the settings!!
function onCommand(_, data) {
	if (EventManager.state == null) {
		bot.sendChat('Please try again later. This feature is still loading...');
		return;
	}

	if (data.params[0] == null) {
		return;
	}

	// ensure we're a moderator
	if (bot.ranks.indexOf(data.user.role) === -1) {
		return;
	}

	bot.moderateDeleteChat(data.id);

	switch (data.params[0]) {
	default:
	case 'help':
	case '?':
		bot.sendChat(`@${data.user.username}: !event (start @user1|stop|last|status)`);
		break;
	case 'start':
		bot.motd.setEnabled(false);
		Raffle.setEnabled(false);
		start(data);
		break;
	case 'stop':
		if (!EventManager.state.started) {
			bot.sendChat("An event is not currently running!");
			return;
		}
		endEvent();
		break;
	case 'last':
		if (!EventManager.state.started) {
			bot.sendChat("An event is not currently running!");
			return;
		}
		EventManager.state.last = !EventManager.state.last;
		if (!EventManager.state.last) {
			bot.sendChat("Song is no longer marked as the last song in the event.");
		}
		validateDB(true);
		break;
	case 'status':
		bot.sendChat(`Event ${EventManager.state.started ? 'active' : 'inactive'}. Last: ${EventManager.state.last ? 'yes' : 'no'}`);
		break;
	}
}

module.exports.init = function init(receivedBot) {
	bot = receivedBot;

	// Add the command counter
	event.AddCommand('event', onCommand);

	// get global state
	db.query(
		"SELECT * FROM settings WHERE name = 'event'", [],
		(err, res) => {
			if (res.rowCount === 1) {
				EventManager.state = res.rows[0].value;
			}
			
			validateDB(false);
		}
	);
};

module.exports.isActive = function isActive() {
	if (EventManager.state == null) {
		return false;
	}
	return EventManager.state.started;
};

module.exports.onAdvance = (last, next) => {
	if (!module.exports.isActive()) {
		return;
	}

	let nextMsg = "";
	let msg = "";

	if (last != null) {
		msg = `Thank you @${last.username} for joining us in our event!`;
	}

	if (next != null) {
		nextMsg = `Please give a big JACR welcome to the next DJ in today's line up, @${next.username}!`;
	}

	if (EventManager.state.last) {
		if (msg !== "") {
			bot.sendChat(`@everyone ${msg}`);
		}

		endEvent();
		return;
	}

	msg += " " + nextMsg;
	if (msg !== "") {
		bot.sendChat(`@everyone ${msg}`);
	}
};
