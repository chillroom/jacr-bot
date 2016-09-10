const Fs = require("fs");
const Path = require("path");
let bot;
let r;
const commands = {};
const handlers = {};
let ChatMessageEvent;

function onChatMessage(data) {
	if (typeof data.user === "undefined") {
		return;
	}

	if (data.message.match(/(\[AFK\].*https?:\/\/.*\.(?:png|jpg|gif))/i)) {
		bot.moderateDeleteChat(data.raw.chatid);
		bot.sendChat(`@${data.user.username} - image/gif AFK responses are not allowed.`);
		return;
	}

	const keys = Object.keys(handlers);
	for (let i = keys.length - 1; i >= 0; i--) {
		handlers[keys[i]](data);
	}

	// Update name if different
	r
		.table('users')
		.getAll("dubtrack", { index: "platform" })
		.filter({ uid: data.user.id })
		.filter(r.row.getField("username").eq(data.user.username).not())
		.update({ username: data.user.username })
		.run()
		.error(bot.errLog);

	// Handle commands

	// split the whole message words into tokens
	const args = data.message.split(" ");

	// check if a command
	if (args[0].charAt(0) !== "!") {
		return;
	}

	const cmd = args[0].substr(1).toLowerCase();

	// Any response?
	if (args.length === 1) {
		if (ChatMessageEvent.responses[cmd] != null) {
			const resp = ChatMessageEvent.responses[cmd];
			const image = resp[Math.floor(Math.random() * resp.length)];
			bot.sendChat(image);
			// return; // Don't return. Let us continue!
		}
	}

	// Does the command exist?
	if (commands[cmd] == null) {
		return;
	}

	data.trigger = cmd;
	data.params = args.slice(1);
	commands[cmd](bot, data);
}

ChatMessageEvent = _bot => {
	const dir = process.cwd() + "/bot/commands";
	
	// base command creation
	Fs.readdirSync(dir).forEach(file => {
		const path = Path.resolve(dir, file);
		Fs.stat(path, (err, stat) => {
			if (err != null) {
				return;
			}
			
			if (!stat || stat.isDirectory()) {
				return;
			}

			if (file.indexOf(".js") === -1) {
				return;
			}

			commands[file.split(".")[0]] = require(path);
		});
	});

	bot = _bot;
	r = bot.rethink;
	ChatMessageEvent.LoadResponses();
	bot.on("chat-message", onChatMessage);
};
module.exports = ChatMessageEvent;


// Create a new command handler
ChatMessageEvent.AddCommand = (cmd, fn) => {
	commands[cmd] = fn;
};

// Create a new onChat event handler
ChatMessageEvent.AddHandler = (key, fn) => {
	handlers[key] = fn;
};

ChatMessageEvent.LoadResponses = () => {
	const responses = {};
	r.
		table('responses').
		filter(
			r.row.getField("platform").eq("dubtrack"),
			{ default: true }
		).
		run().
		then(result => {
			for (let i = result.length - 1; i >= 0; i--) {
				const doc = result[i];
				responses[doc.name] = doc.responses;

				for (let k = doc.aliases.length - 1; k >= 0; k--) {
					responses[doc.aliases[k]] = doc.responses;
				}
			}

			ChatMessageEvent.responses = responses;
		}).
		error(bot.errLog);
};
