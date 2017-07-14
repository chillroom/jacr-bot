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

	if (changed) {
		db.query(
			"INSERT INTO settings(name, value) VALUES('event', $1) ON CONFLICT(name) DO UPDATE SET value = $1",
			[JSON.stringify(EventManager.state)],
			bot.dbLog("Internal error. Could not insert verified settings for event.")
		);
	}
}

function start(data) {
	if (EventManager.state.started) {
		bot.sendChat("Event has already started!");
		return;
	}
	EventManager.state.started = true;

	const users = bot.readUsers(data.params.slice(1), true);
	if (users === false) {
		return;
	}
	EventManager.state.user = users[0];

	bot.moderateLockQueue(true, () => {
		// remove non artists
		for (const queue of bot.getQueue()) {
			if ((EventManager.state.user != null) && (queue.uid !== EventManager.state.user)) {
				bot.moderateRemoveDJ(queue.uid);
			}
		}
	});

	let suffix = "Enjoy the event!";
	if (EventManager.state.user != null) {
		for (const u of bot.getUsers()) {
			if (EventManager.state.user === u.id) {
				suffix = `Welcome @${u.username} to the room and enjoy the event!`;
				break;
			}
		}
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

	switch (data.params[0]) {
	default:
	case 'help':
	case '?':
		bot.sendChat(`@${data.user.username}: !event (start @user1|stop|status)`);
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
		EventManager.state.started = false;
		EventManager.state.user = null;
		bot.moderateLockQueue(false);
		bot.sendChat("The event is now over, thanks for coming! Make sure you check out our Facebook page for upcoming events: https://fb.me/justachillroom");
		Raffle.setEnabled(true);
		bot.motd.setEnabled(true);
		validateDB(true);
		break;
	case 'status':
		bot.sendChat(`Event ${EventManager.state.started ? 'active' : 'inactive'}.`);
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
