var Fs = require("fs");
var Path = require("path");
var bot;
var r;
var commands = {};

var ChatMessageEvent = function(_bot) {
	var dir = process.cwd() + "/bot/commands";
	
	// base command creation
	Fs.readdirSync(dir).forEach(file => {
		var _path = Path.resolve(dir, file);
		Fs.stat(_path, (err, stat) => {
			if (err != null) {
				return;
			}
			
			if (!stat || stat.isDirectory()) {
				return;
			}

			if (file.indexOf(".js") === -1) {
				return;
			}

			commands[file.split(".")[0]] = require(_path);
		});
	});

	bot = _bot;
	r = bot.rethink;
	loadResponses();
	bot.on("chat-message", onChatMessage);
};

module.exports = ChatMessageEvent;

// Create a new command handler
ChatMessageEvent.AddCommand = function(cmd, fn) {
	commands[cmd] = fn;
};

var handlers = {};
// Create a new onChat event handler
ChatMessageEvent.AddHandler = function(key, fn) {
	handlers[key] = fn;
};

var responses = {};
function loadResponses() {
	r.table('responses').filter(r.row.getField("platform").eq("dubtrack"), {default: true}).run().then(
		function(result) {
			for (var i = result.length - 1; i >= 0; i--) {
				var doc = result[i];
				responses[doc.name] = doc.responses;

				for (var k = doc.aliases.length - 1; k >= 0; k--) {
					responses[doc.aliases[k]] = doc.responses;
				}
			}
		}
	).error(bot.errLog);
}

function onChatMessage(data) {
	if (typeof data.user === "undefined") {
		return;
	}

	if (data.message.match(/(\[AFK\].*https?:\/\/.*\.(?:png|jpg|gif))/i)) {
		bot.moderateDeleteChat(data.raw.chatid);
		bot.sendChat(bot.identifier + "@" + data.user.username + " - image/gif AFK responses are not allowed.");
		return;
	}

	var keys = Object.keys(handlers);
	for (var i = keys.length - 1; i >= 0; i--) {
		handlers[keys[i]](data);
	}

	// Update name if different
	r
		.table('users')
		.getAll("dubtrack", {index: "platform"})
		.filter({uid: data.user.id})
		.filter(r.row.getField("username").eq(data.user.username).not())
		.update({username: data.user.username})
		.run().error(bot.errLog);

	// Handle commands

	// split the whole message words into tokens
	var args = data.message.split(" ");

	// check if a command
	if (args[0].charAt(0) !== "!") {
		return;
	}

	var cmd = args[0].substr(1).toLowerCase();

	// Any response?
	if (responses[cmd] != null) {
		var resp = responses[cmd];
		const image = resp[Math.floor(Math.random() * resp.length)];
		bot.sendChat(image);
		return;
	}

	// Does the command exist?
	if (commands[cmd] == null) {
		return;
	}

	data.trigger = cmd;
	data.params = args.slice(1);
	commands[cmd](bot, data);
}
