// Copyright (c) Qais Patankar 2016 - MIT License

let r;
let bot;
const event = require('./events/chat-message.js');

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

	const offsetKarma = (data.user.username.toLowerCase() === username.toLowerCase()) ? -1 : 1;
	r
		.table("users")
		.getAll(username.toLowerCase(), { index: "username_l" })
		.filter({ platform: "dubtrack" })
		.update(
			{ karma: r.row.getField("karma").add(offsetKarma) },
			{ returnChanges: true }
		)
		.run()
		.then(result => {
			if (result.replaced === 0) {
				bot.sendChat(`@${data.user.username}, I don't know who ${username} is!`);
				return;
			} else if (result.replaced !== 1) {
				bot.sendChat(`@${data.user.username}, I found multiple people?? Tell @qaisjp about ${username}!`);
				return;
			}

			const newDoc = result.changes[0].new_val;
			let suffix = "";

			if (data.user.username === username) {
				suffix = "No karma whoring for you!";
			}

			bot.sendChat(`${username} is now at ${newDoc.karma} karma! ${suffix}`);
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

	const query = { karma: newKarma };

	// if is relative
	if ((newKarma < 0) || (data.params[1].substr(0, 1) === "+")) {
		query.karma = r.row("karma").add(newKarma);
		// bot.sendChat("updating..", query.karma)
	}
		
	r
		.table("users")
		.getAll(username.toLowerCase(), { index: "username_l" })
		.filter({ platform: "dubtrack" })
		.update(query)
		.run();
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
			bot.moderateMoveDJ(person.id, pos - 1);
		},
	},
};

function commandBuy(data) {
	if (bot.ranks.indexOf(data.user.role) === -1) {
		return;
	}
	
	bot.moderateDeleteChat(data.id);

	const item = shop[data.params[0]];

	if (item == null) {
		bot.sendChat("Syntax: `!karma buy boost` (500 karma) to jump a spot, `!karma buy front` (1500 karma) to jump to spot 2.");
		return;
	}

	
	const username = data.user.username;
	const person = bot.getUserByName(username);
	if (person == null) {
		bot.sendChat(`Dubtrack does not know who you are, sorry, @${username}.`);
		return;
	}

	const user = r
		.table("users")
		.getAll(username.toLowerCase(), { index: "username_l" })
		.filter({ platform: "dubtrack" }).nth(0);

	r.branch(
		user.getField("karma").eq(item.cost).or(user.getField("karma").gt(item.cost)),

		r.branch(
			user.update({ karma: r.row("karma").add(-item.cost) }),
			{ karma_transaction_success: true },
			{ karma_transaction_success: false }
		),
		
		{ karma_transaction_success: false }
	)
	.run()
	.then(doc => {
		if (!doc.karma_transaction_success) {
			bot.sendChat("You do not have enough karma!");
			return;
		}

		item.action(person);
	});
}

function onCommand(_, data) {
	switch (data.params[0]) {
	case "help":
		bot.sendChat("Karma is rewarded for new plays and well-received plays. Use `!karma @user` to find the karma of a friend, or omit the username to find your own karma. Soon: Karma can be gifted using `!karma gift @user amount`, and spent using `!karma buy front` or `!karma buy boost`.");
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

	r
		.table("users")
		.getAll(username.toLowerCase(), { index: "username_l" })
		.filter({ platform: "dubtrack" })
		.getField("karma")
		.run()
		.then(docs => {
			if (docs.length === 0) {
				bot.sendChat(`@${data.user.username}, I don't know who ${username} is!`);
				return;
			} else if (docs.length !== 1) {
				bot.sendChat(`@${data.user.username}, I found multiple people?? Tell @qaisjp about ${username}!`);
				return;
			}

			const karma = docs[0];
			const outName = (username === data.user.username.toLowerCase()) ? "you are" : `@${username} is`;
			bot.sendChat(`@${data.user.username}, ${outName} at ${karma} karma!`);
			return;
		});
}

module.exports.init = function init(receivedBot) {
	bot = receivedBot;
	r = bot.rethink;
	event.AddCommand('karma', onCommand);
//	event.AddHandler("karma", onChat);
};

