var Fs = require("fs");
var Path = require("path");
var bot;
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
	loadResponses();
	bot.on("chat-message", onChatMessage);
};

ChatMessageEvent.AddCommand = function(cmd, fn) {
	commands[cmd] = fn;
};

module.exports = ChatMessageEvent;

const r = require("rethinkdb");
var responses = {};

function loadResponses() {
	r.table('responses').filter(r.row.getField("site").eq("dubtrack"), {default: true}).run(bot.rethink, function(err, cursor) {
		if (err) throw err;
		cursor.toArray(function(err, result) {
			if (err) throw err;
			for (var i = result.length - 1; i >= 0; i--) {
				var doc = result[i];
				responses[doc.name] = doc.responses;

				for (var k = doc.aliases.length - 1; k >= 0; k--) {
					responses[doc.aliases[k]] = doc.responses;
				}
			}
		});
	});
}

const MOTD = require("../motd.js");

function onChatMessage(data) {
	if (typeof data.user === "undefined") {
		return;
	}

	if (data.message.match(/(\[AFK\].*https?:\/\/.*\.(?:png|jpg|gif))/i)) {
		bot.moderateDeleteChat(data.raw.chatid);
		bot.sendChat(bot.identifier + "@" + data.user.username + " - image/gif AFK responses are not allowed.");
		return;
	}

	// Alert the MOTD manager to the message
	MOTD.onChat();

	bot.db.models.person.findOne({
		uid: data.user.id
	}, (err, person) => {
		if (err) {
			bot.log("error", "BOT", err);
			return;
		}

		if (!person) {
			person = new bot.db.models.person({
				uid: data.user.id
			});
		}

		person.username = data.user.username;
		person.dubs = data.user.dubs;
		person.lastChat = new Date();
		person.save();
	});

	// split the whole message words into tokens
	var args = data.message.split(" ");

	// check if a command
	if (args[0].charAt(0) !== "!") {
		return;
	}

	var cmd = args[0].substr(1).toLowerCase();

	// Any response?
	if (responses[data.trigger] != null) {
		var resp = responses[cmd];
		const image = resp[Math.floor(Math.random() * resp.length)];
		bot.sendChat(image);
		return;
	}

	// Does the command exist?
	if (commands[data.trigger] == null) {
		return;
	}

	data.trigger = cmd;
	data.params = args.slice(1);
	commands[cmd](bot, data);
}
