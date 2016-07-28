module.exports = (bot, data) => {
	if (bot.ranks.indexOf(data.user.role) === -1) {
		return;
	}

	if (data.params[1] == null) {
		bot.sendChat("Usage: !move @user +-<position> (only supply sign for relative move)");
		return;
	}

	// remove the @
	let username = data.params[0];
	if (username.substr(0, 1) === "@") {
		username = username.substr(1);
	}

	let pos = parseInt(data.params[1], 10);
	if (isNaN(pos) || (pos === 0)) {
		bot.sendChat("Invalid number supplied");
		return;
	}

	const person = bot.getUserByName(username);
	if (person == null) {
		bot.sendChat("Could not find person. Names are case sensitive.");
		return;
	}

	if (!bot.getQueue().some(v => person.id === v.uid)) {
		bot.sendChat("User is not in queue");
		return;
	}

	if ((pos < 0) || (data.params[1].substr(0, 1) === "+")) {
		// move relative
		pos += bot.getQueuePosition(person.id);
	} else if (pos >= bot.getQueue().length) {
		pos = bot.getQueue().length;
	}

	bot.moderateMoveDJ(person.id, pos - 1);
	bot.sendChat(`${username} moved to position ${pos}`);
};
