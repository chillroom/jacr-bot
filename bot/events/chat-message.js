const Fs = require("fs");
const Path = require("path");
const db = require("../lib/db.js");

let bot;
let r;
const commands = {};
const handlers = {};
let ChatMessageEvent;

function onChatMessage(data) {
	if (typeof data.user === "undefined") {
		return;
	}

	// if (data.message.match(/(\[AFK\].*https?:\/\/.*\.(?:png|jpg|gif))/i)) {
	// 	bot.moderateDeleteChat(data.raw.chatid);
	// 	bot.sendChat(`@${data.user.username} - image/gif AFK responses are not allowed.`);
	// 	return;
	// }

	const keys = Object.keys(handlers);
	for (let i = keys.length - 1; i >= 0; i--) {
		handlers[keys[i]](data);
	}

	// Update name & last status
	bot.util.updateUser(data.user.id, data.user.username, 'message', data.message);

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

			bot.moderateDeleteChat(data.id);
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

	db.query(`
		SELECT array_agg(cmds.name) as cmds, groups.messages FROM
			response_commands as cmds,
			response_groups as groups
		WHERE
			cmds.group = groups.id
		GROUP BY groups.messages
	`, [], function(err, res) {
		if (bot.checkError(err, 'pgsql', 'could not receive responses')) {
			return;
		}
		
		for (let i = res.rows.length - 1; i >= 0; i--) {
			const row = res.rows[i];

			for (let k = row.cmds.length - 1; k >= 0; k--) {
				responses[row.cmds[k]] = row.messages;
			}
		}

		ChatMessageEvent.responses = responses;
		bot.log("info", "responses", "Loaded responses!");
	
	});
};
