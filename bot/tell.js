
let r;
let bot;
const Raffle = require("./raffle.js");
const event = require('./events/chat-message.js');
let TellMessages;

// TellMessages = {
//  [target] = {
//      [from] = message
//  }
// }

// States should only be accessed by one bot at a time
function updateState() {
	r.table('settings').get('tells.dubtrack').replace(TellMessages).run().
		error(bot.errLog);
}

function onChat(data) {
	if (TellMessages == null) {
		return;
	}

	const source = data.user.username.toLowerCase();
	const messages = TellMessages[source];
	if (messages == null) {
		return;
	}

	Object.keys(messages).forEach(key => {
		const msg = messages[key];
		bot.sendChat(`@${data.user.username} - memo from @${key}: ${msg}`);
	});

	delete TellMessages[source];
	updateState();
}

// TODO: Don't update the entire state or all the settings!!
function onCommand(_, data) {
	if (TellMessages == null) {
		bot.sendChat('Please try again later. This feature is still loading...');
		return;
	}

	if (data.params[0] == null) {
		bot.sendChat(`@${data.user.username} - Say something when a user returns - Usage: !tell @user message`);
		return;
	}

	let username = data.params[0].toLowerCase();
	if (username.substr(0, 1) === "@") {
		username = username.substr(1);
	}

	if (username === "name") {
		return;
	}

	const message = data.params.slice(1).join(" ");
	if (message === "") {
		bot.sendChat(`@${data.user.username} - Say something when a user returns - Usage: !tell @user message`);
		return;
	}

	if (TellMessages[username] == null) {
		TellMessages[username] = {};
	}

	TellMessages[username][data.user.username] = message;
	updateState();
	bot.moderateDeleteChat(data.id);
}

module.exports.init = function init(receivedBot) {
	bot = receivedBot;
	r = bot.rethink;

	// event.AddCommand('tell', onCommand);
	// event.AddHandler("tell", onChat);

	// get global state
	// r.table('settings').get('tells.dubtrack').run().then(doc => {
	// 	TellMessages = doc;
	// })
	// .error(bot.errLog);
};
