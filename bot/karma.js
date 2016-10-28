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

	let offsetKarma = (data.user.username.toLowerCase() == username.toLowerCase()) ? -1 : 1
	r
		.table("users")
		.getAll(username.toLowerCase(), {index: "username_l"})
		.filter({ platform:"dubtrack" })
		.update(
			{ karma: r.row.getField("karma").add(offsetKarma) },
			{ returnChanges:true }
		).run().then(result => {
			if (result.replaced === 0) {
				bot.sendChat(`@${data.user.username}, I don't know who ${username} is!`);
				return;
			} else if (result.replaced !== 1) {
				bot.sendChat(`@${data.user.username}, I found multiple people?? Tell @qaisjp about ${outName}!`);
				return;
			}

			const newDoc = result.changes[0].new_val;
			let suffix = "";

			if (data.user.username == username) {
				suffix = "No karma whoring for you!";
			}

			bot.sendChat(`${username} is now at ${newDoc.karma} karma! ${suffix}`);
		});
}

function onCommand(_, data) {
	let username = data.user.username;

	if (data.params[0] != null) {
		username = data.params[0].toLowerCase();
		if (username.substr(0, 1) === "@") {
			username = username.substr(1);
		}
	}

	r
		.table("users")
		.getAll(username, { index: "username_l" })
		.filter({platform: "dubtrack"})
		.getField("karma")
		.run().then(docs => {
			if (docs.length === 0) {
				bot.sendChat(`@${data.user.username}, I don't know who ${username} is!`);
				return;
			} else if (docs.length !== 1) {
				bot.sendChat(`@${data.user.username}, I found multiple people?? Tell @qaisjp about ${outName}!`);
				return;
			}

			const karma = docs[0];
			const outName = (username == data.user.username) ? "you are" : `@${username} is`;
			bot.sendChat(`@${data.user.username}, ${outName} at ${karma} karma!`);
			return;
		});
}

module.exports.init = function init(receivedBot) {
	bot = receivedBot;
	r = bot.rethink;

	event.AddCommand('karma', onCommand);
	//event.AddHandler("karma", onChat);
};
