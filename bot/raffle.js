// Copyright (c) Qais Patankar 2016 - MIT License

const moment = require("moment");
const db = require("./lib/db");

const Raffle = {
	onAdvance: () => {},
	
	settings: null,
	startingMessage: "@djs Type \"!join\" to join the raffle and have a chance to get moved to the front! Good luck.",

	warningTimer: null,
	finalTimer: null,
	nextTimer: null,
};
let bot;

// Commits the local settings to database
function validateDB(forceChange) {
	let changed = forceChange === true;

	if (Raffle.settings == null) {
		Raffle.settings = {};
		changed = true;
	}

	// TODO: content verification;
	if (Raffle.settings.enabled !== true && Raffle.settings.enabled !== false) {
		Raffle.settings.enabled = false;
		changed = true;
	}

	if (Raffle.settings.started !== true && Raffle.settings.started !== false) {
		Raffle.settings.started = false;
		changed = true;
	}

	const rounded = Math.round(Raffle.settings.minUsers);
	if (isNaN(rounded)) {
		Raffle.settings.minUsers = 5;
		changed = true;
	} else if (rounded !== Raffle.settings.minUsers) {
		Raffle.settings.minUsers = rounded;
		changed = true;
	}

	if (Raffle.settings.lastRaffleTime == null || !moment(Raffle.settings.lastRaffleTime).isValid()) {
		Raffle.settings.lastRaffleTime = moment();
		changed = true;
	}

	if (changed) {
		db.query(
			"INSERT INTO settings(name, value) VALUES('raffle', $1) ON CONFLICT(name) DO UPDATE SET value = $1",
			[JSON.stringify(Raffle.settings)],
			bot.dbLog("Internal error. Could not insert verified settings for raffle.")
		);
	}
}

function onJoinCommand(_, data) {
	if (!Raffle.settings.started) {
		bot.sendChat("There isn't a raffle at this time!");
		return;
	}

	const presence = v => data.user.id.indexOf(v.uid) >= 0;

	// Already entered?
	if (Raffle.settings.users.some(presence)) {
		bot.sendChat(`@${data.user.username} you've already entered the raffle!`);
		return;
	}
    
    // Not in queue?
	if (!bot.getQueue().some(presence)) {
		bot.sendChat(`@${data.user.username} you must be in the queue to enter the raffle!`);
		return;
	}

	if (bot.getQueuePosition(data.user.id) === 0) {
		bot.sendChat(`@${data.user.username} you're already at #1!`);
		return;
	}

	const entrant = { uid: data.user.id, username: data.user.username };
	Raffle.settings.users.push(entrant);

	validateDB(true);

	bot.sendChat(`@${data.user.username}, you have entered the raffle!`);
}

function onCommand(_, data) {
	// ensure we're a moderator
	if (bot.ranks.indexOf(data.user.role) === -1) {
		return;
	}

	switch (data.params[0]) {
	case "help":
		bot.sendChat(`@${data.user.username}: !raffle (enable|disable|start|stop|status)`);
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
		if (Raffle.settings.started) {
			bot.sendChat("Raffle is already started!");
			return;
		}

		Raffle.start(false, true); // quiet = false, force = true
		break;
	case "stop":
		Raffle.stop();
		break;
	case "status":
		Raffle.sendStatus();
		break;
	default:
	}
}

Raffle.sendStatus = () => {
	let message = "Raffles: ";
	message += Raffle.settings.enabled ? "enabled" : "disabled";
	message += ", and ";
	message += Raffle.settings.started ? "active" : "waiting";
	bot.sendChat(message);
};

Raffle.setEnabled = b => {
	Raffle.settings.enabled = b;
	Raffle.settings.started = false;
	validateDB(true);

	// clear or start any timers
	Raffle.stop();
};


function finalTimerCallback() {
	// Clean up our timer
	Raffle.finalTimer = null;

	const users = Raffle.settings.users;
	// Nobody joined the raffle?!
	if (users.length === 0) {
		bot.sendChat("No one entered the raffle! Be sure to pay attention for the next one!");
		Raffle.stop();
		return;
	}
	
	// Decide a random winner
	const randomWinner = users[Math.floor(Math.random() * users.length)];

	// Move the random winner to the second-front
	if (bot.getQueuePosition(randomWinner.uid) > 0) {
		bot.moderateMoveDJ(randomWinner.uid, 1);
	}
	
	// Announce the winner
	if (users.length === 1) {
		bot.sendChat(`The raffle has ended! 1 user participated and our "lucky" winner is: @${randomWinner.username}!`);
	} else {
		bot.sendChat(`The raffle has ended! ${users.length} users participated and our lucky winner is: @${randomWinner.username}!`);
	}

	// Clean up
	Raffle.stop();
}

function warningTimerCallback() {
	// Clean up our timer
	Raffle.warningTimer = null;

	const numberEntered = Raffle.settings.users.length;
	bot.sendChat(`The raffle expires in 20 seconds, ${numberEntered} user${numberEntered === 1 ? " is" : "s are"} participating! Hurry @djs and "!join"`);

	Raffle.finalTimer = setTimeout(finalTimerCallback, 1000 * 20, bot); // 20 seconds = 1000 milliseconds (1 second)
}

Raffle.start = (quietMode, force) => {
	// Kill our next timer
	if (Raffle.nextTimer != null) {
		clearTimeout(Raffle.nextTimer);
		Raffle.nextTimer = null;
	}

	// No over-starting, even if forced.
	if (Raffle.settings.started) {
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
			bot.log("info", "raffle", `Postponing raffle (not enough people) (5 people needed, have ${bot.getQueue().length} people)`);
			Raffle.nextTimer = setTimeout(Raffle.start, 1000 * 60 * 5); // try starting again in five minutes
			return;
		}
	}

	if (!quietMode) {
		bot.sendChat(Raffle.startingMessage);
	}

	// Update the state
	Raffle.settings.lastRaffleTime = new Date(); // now!
	Raffle.settings.started = true;

	// Start our timer
	Raffle.warningTimer = setTimeout(warningTimerCallback, 1000 * 100); // 100 seconds = 1 minutes 40 seconds

	// Commit the state to database
	validateDB(true);
};

// updateInformation triggers information reloading
Raffle.reload = () => {
	// reset our settings object
	Raffle.settings = null;

	// get settings
	db.query(
		"SELECT * FROM settings WHERE name = 'raffle'", [],
		(err, res) => {
			if (res.rowCount === 1) {
				Raffle.settings = res.rows[0].value;
			}
			
			validateDB(false);

			// Does a raffle already exist?
			if (Raffle.settings.started === true) {
				bot.log("info", "raffle", "Starting a raffle (already started on boot)");
				Raffle.settings.started = false; // explicitly circumvent over-starting prevention mechanism
				Raffle.start(true, true); // quiet = true, force = true
				return;
			}

			const nextRaffleTime = moment(Raffle.settings.lastRaffleTime).add(45, "minutes");
			// console.log("Now: " + nextRaffleTime)
			// If 45 minutes has passed since the last time
			if (nextRaffleTime.isBefore()) {
				bot.log("info", "raffle", "Starting a raffle in 10 seconds (45 minute boot threshold)");
				setTimeout(Raffle.start, 1000 * 10, false, false); // quiet = false, force = false
				return;
			}

			Raffle.stop();
			// var duration = moment().sub(nextRaffleTime).duration().get("milliseconds");
			// console.log(duration/1000 + " seconds left");
		}
	);
};

Raffle.init = (receivedBot) => {
	bot = receivedBot;

	// Add the command counter
	const event = require("./events/chat-message.js");

	event.AddCommand("raffle", onCommand);
	event.AddCommand("join", onJoinCommand);

	Raffle.reload();
};

Raffle.stop = () => {
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
	Raffle.settings.users = [];
	Raffle.settings.started = false;

	if (Raffle.settings.enabled) {
		// Restart our timer
		// Our next raffle is in fifteen minutes!
		Raffle.nextTimer = setTimeout(Raffle.start, 1000 * 60 * 45);
		bot.log("info", "raffle", "The next raffle has been scheduled");
	}

	// Commit the state
	validateDB(true);
};


module.exports = Raffle;
