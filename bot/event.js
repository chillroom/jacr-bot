// Copyright (c) Qais Patankar 2016 - MIT License

let r;
let bot;
const Raffle = require("./raffle.js");
const event = require('./events/chat-message.js');
const EventManager = {
	state: null,
};

// States should only be accessed by one bot at a time
function updateState(key) {
	const out = (key == null) ? EventManager.state : { [key]: EventManager.state[key] };
	r.table('settings').get('event.dubtrack').update(out).run().
		error(bot.errLog);
}

function readStringUsers(users, convertToIDs) {
	const unseenUsers = users.slice();

	// if convertToIDs has any value, use the bot to
	// check if the user is in the room
	const outUsers = [];

	for (const user of bot.getUsers()) {
		// if found, remove from unseen!
		const index = unseenUsers.indexOf(`@${user.username}`);
		if (index > -1) {
			unseenUsers.splice(index, 1);
			outUsers.push((convertToIDs === true) ? user.id : user.username);
		}

		if (unseenUsers.length === 0) {
			break;
		}
	}

	if (unseenUsers.length > 0) {
		bot.sendChat(`Operation completed without missing users: ${unseenUsers.join(", ")}`);
	}

	return outUsers;
}

function start(data) {
	if (EventManager.state.started) {
		bot.sendChat("Event has already started!");
		return;
	}
	EventManager.state.started = true;
	EventManager.state.user = readStringUsers(data.params.slice(1), true)[0];

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
	bot.sendChat(`Our event is beginning and the queue is now locked. ${suffix}`);
	updateState();
}


// TODO: Don't update the entire state or all the settings!!
function onCommand(_, data) {
	if (EventManager.state == null) {
		bot.sendChat('Please try again later. This feature is still loading...');
		return;
	}

	if (data.params[0] == null) {
		bot.sendChat("https://i0.wp.com/just-a-chill-room.net/wp-content/uploads/2016/07/4th_anniversary_flyer05.jpg?resize=750%2C1061&ext=.jpg");
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
		start(data);
		Raffle.setEnabled(false);
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
		updateState();
		break;
	case 'status':
		bot.sendChat(`Event ${EventManager.state.started ? 'active' : 'inactive'}.`);
		break;
	}
}

module.exports.init = function init(receivedBot) {
	bot = receivedBot;
	r = bot.rethink;

	// Add the command counter
	event.AddCommand('event', onCommand);

	// get global state
	r.table('settings').get('event.dubtrack').run().then(doc => {
		EventManager.state = doc;
	})
	.error(bot.errLog);
};

module.exports.isActive = function isActive() {
	return EventManager.state.started;
};
