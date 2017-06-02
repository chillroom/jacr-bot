// Copyright (c) Qais Patankar 2016 - MIT License

let r;
let bot;
const event = require('./events/chat-message.js');
const db = require('./lib/db');

function onChat(data) {
	const lastChars = data.message.slice(-2);
	if ((lastChars !== "++")) {
		return;
	}

	if (data.message.split(" ").length > 1) {
		return;
	}
	
	let username = data.message.slice(0, -2);
	if (username.substr(0, 1) === "@") {
		username = username.substr(1);
	}

	bot.util.getUserIDFromName(username, (nameErr, dubid) => {
		if (nameErr != null) {
			bot.sendChat(`@${data.user.username}, Dubtrack doesn't know who ${username} is!`);
			return;
		}

		const whore = data.user.id === dubid;
		const offsetKarma = whore ? -1 : 1;

		db.query(`UPDATE dubtrack_users SET karma = karma + $2 where dub_id = $1 RETURNING karma`, [dubid, offsetKarma], (err, res) => {
			if (bot.checkError(err, "pgsql", 'could not update karma++')) {
				bot.sendChat("Could not update karma++.");
				return;
			} else if (res.rowCount === 0) {
				bot.sendChat(`@${data.user.username}, I don't know who ${username} is!`);
				return;
			}

			const suffix = whore ? "No karma whoring for you!" : "";
			bot.sendChat(`${username} is now at ${res.rows[0].karma} karma! ${suffix}`);
		});
	});
}


function commandSet(data) {
	if (bot.ranks.indexOf(data.user.role) === -1) {
		return;
	}
	
	bot.moderateDeleteChat(data.id);

	if (data.params[1] == null) {
		bot.sendChat("Syntax: `!karma set @username AMOUNT`. Amount can be prefixed with a sign to update it relatively.");
		return;
	}

	let username = data.params[0].toLowerCase();
	if (username.substr(0, 1) === "@") {
		username = username.substr(1);
	}
	
	const newKarma = parseInt(data.params[1], 10);
	if (isNaN(newKarma)) {
		bot.sendChat("Invalid number supplied");
		return;
	}

	let query = "$2";

	// if is relative
	if ((newKarma < 0) || (data.params[1].substr(0, 1) === "+")) {
		query = "karma + $2";
	}

	bot.util.getUserIDFromName(username, (nameErr, dubid) => {
		if (nameErr != null) {
			bot.sendChat("Could not find user.");
			return;
		}

		db.query(`UPDATE dubtrack_users SET karma = ${query} where dub_id = $1`, [dubid, newKarma], (err, res) => {
			if (bot.checkError(err, "pgsql", 'could not update karma')) {
				bot.sendChat("Could not update karma.");
				return;
			} else if (res.rowCount === 0) {
				bot.sendChat("Could not find user in database.");
				return;
			}
		});
	});
}

const shop = {
	front: {
		cost: 1500,
		action: person => {
			const pos = 2;
			bot.moderateMoveDJ(person.id, pos - 1);
		},
	},

	boost: {
		cost: 500,
		action: person => {
			const pos = bot.getQueuePosition(person.id) - 1;
			bot.moderateMoveDJ(person.id, pos);
		},
	},
};

function commandBuy(data) {	
	bot.moderateDeleteChat(data.id);

	const item = shop[data.params[0]];

	if (item == null) {
		bot.sendChat("Syntax: `!karma buy boost` (500 karma) to jump a spot, `!karma buy front` (1500 karma) to jump to spot 2.");
		return;
	}

	db.query(
		`UPDATE dubtrack_users SET karma = karma - $2 where (dub_id = $1) and (karma > $2);`,
		[data.user.id, item.cost],
		(err, res) => {
			if (bot.checkError(err, "pgsql", 'could not buy with karma')) {
				bot.sendChat("Could not buy item, internal error.");
				return;
			}

			if (res.rowCount === 0) {
				bot.sendChat(`You do not have enough karma, @${data.user.username}!`);
				return;
			}

			item.action(data.user);
		}
	);

}

function onCommand(_, data) {
	switch (data.params[0]) {
	case "help":
		bot.sendChat("Karma is rewarded for new plays and well-received plays. Use `!karma @user` to find the karma of a friend, or omit the username to find your own karma. It can be spent using `!karma buy front` or `!karma buy boost`. Soon: Karma can be gifted using `!karma gift @user amount`.");
		return;
	case "gift":
		// todo;
		return;
	case "buy":
		data.params.shift();
		commandBuy(data);
		return;
	case "set":
		data.params.shift();
		commandSet(data);
		return;
	default:
		break;
	}

	let username = data.user.username.toLowerCase();

	if (data.params[0] != null) {
		username = data.params[0].toLowerCase();
		if (username.substr(0, 1) === "@") {
			username = username.substr(1);
		}
	}

	bot.util.getUserIDFromName(username, (nameErr, dubid) => {
		if (nameErr != null) {
			bot.sendChat(`@${data.user.username}, ${username} doesn't use Dubtrack!`);
			return;
		}

		db.query(
			`SELECT karma FROM dubtrack_users WHERE (dub_id = $1)`,
			[dubid],
			(err, res) => {
				if (bot.checkError(err, "pgsql", 'could not get karma')) {
					bot.sendChat("Could not find user, internal error");
					return;
				}
				
				if (res.rowCount === 0) {
					bot.sendChat(`@${data.user.username}, I don't know who ${username} is!`);
					return;
				}

				const outName = (username === data.user.username.toLowerCase()) ? "you are" : `@${username} is`;
				bot.sendChat(`@${data.user.username}, ${outName} at ${res.rows[0].karma} karma!`);
			}
		);
	});	
}

module.exports.init = function init(receivedBot) {
	bot = receivedBot;
	
	event.AddCommand('karma', onCommand);
	// event.AddHandler("karma", onChat);
};

