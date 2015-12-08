var fs = require("fs");

module.exports = function (bot) {
	var commands = {},
		cmd = process.cwd() + "/app/bot/commands",
		count = 0;
	fs.readdirSync(cmd).forEach(function (file, index, arr) {
		if (file.indexOf(".js") > -1) {
			commands[file.split(".")[0]] = require(cmd + "/" + file);
			count++;
		}
		if (index === arr.length - 1) {
			bot.log("info", "BOT", "Command count: " + count);
		}
	});
	bot.on("chat-message", function (data) {
		var cmd = data.message,
			//split the whole message words into tokens
			tokens = cmd.split(" "),
			// array of the command triggers
			parsedCommands = [];
		//command handler
		tokens.forEach(function (token) {
			if (token.substr(0, 1) === "!" && parsedCommands.indexOf(token.substr(1)) == -1) {
				// add the command used to the data sent from the chat to be used later
				data.trigger = token.substr(1).toLowerCase();
				parsedCommands.push(data.trigger);

				//if very first token, it's a command and we need to grab the params (if any) and add to the data sent from chat
				if (tokens.indexOf(token) === 0) {
					//the params are an array of the remaining tokens
					data.params = tokens.slice(1);
					//exec command
					commands[data.trigger](bot, data);
				}
			}
			//check to see if any of the words match an emoji
			else if (bot.emojis.indexOf(token) > -1) {
				//if it does, find or create db entery, incrementing the count
				bot.db.models.emojiCount.findOne({
					emoji: token
				}, function (err, doc) {
					if (doc) {
						doc.count++;
						doc.save();
					} else {
						doc = {
							emoji: token,
							count: 0
						};
						doc.count++;
						bot.db.models.emojiCount.create(doc, function (err) {
							if (err) {
								bot.log("error", "BOT", err);
							}
						});
					}
					if (err) {
						bot.log("error", "BOT", err);
					}
				});
			}
		});
		//DB store
		//only storing the chat ID's, user IDs, and username so that the DB file doesn't get too big yo!
		if (typeof (data.user) !== "undefined") {
			var chatSchema = {
				username: data.user.username,
				chatid: data.raw.chatid
			};
			bot.db.models.chat.create(chatSchema, function (err) {
				if (err) {
					bot.log("error", "BOT", err);
				}
			});
		}
	});
};
