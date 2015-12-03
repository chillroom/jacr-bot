var DubAPI = require("dubapi"),
	mongoose = require("mongoose"),
	log = require("jethro"),
	pkg = require("../package.json"),
	commands = require("./commands"),
	config = require("../config");

if (typeof config.botName === "undefined") {
	throw Error("Please set the BOT_NAME evironment variable or add bot username to the config.js file");
}

if (typeof config.botPass === "undefined") {
	throw Error("Please set the BOT_PASS evironment variable or add bot password to the config.js file");
}
if (typeof config.roomURL === "undefined") {
	throw Error("Please set the ROOM_URL environment variable or add the room URL to the config.js file");
}

mongoose.connect(process.env.MONGO || "mongodb://betabot:MickieRocks123@linus.mongohq.com:10016/chill_bot", {
	server: {
		auto_reconnect: true
	}
});

new DubAPI({
	username: config.botName,
	password: config.botPass
}, function (err, bot) {
	if (err) {
		return log("error", "BOT", err);
	}
	// purps array has now become bot.ranks array, so that it is easier to use within the commands
	bot.ranks = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001"];
	//if want to give vip perm, use this instead of ranks
	bot.vips = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001", "5615fe1ee596154fc2000001"];
	bot.devs = ["tigerpancake", "mclovinthesex", "nitroghost"];
	//added protection to protect against double skips
	bot.protection = false;
	//added a bot identifier to the bot to be sent along with the bot responses. added it here so it's easy to change if needed
	//make sure to add a space at the end so we don't need to include it all the time like bot.idenifier + " " + "this text"
	bot.identifier = ":white_small_square: ";
	//added array of emojis to bot
	bot.emojis = require("./emojis");
	//added emoji reset to be used to reset the count back to 0 (only at the end of the week);
	bot.emojisReset = false;
	//added emoji pause to be used to stop double enteries in the days tracker
	bot.emojisPause = false;
	//added DB to bot
	bot.db = mongoose.connection;
	bot.db.on("error", function (err) {
		log("error", "BOT", "MongoDB connection error:" + err);
	});

	bot.db.once("open", function callback() {
		log("info", "BOT", "MongoDB connection is established");
	});

	bot.db.on("disconnected", function () {
		log("warning", "BOT", "MongoDB disconnected!");
		mongoose.connect(process.env.MONGO_URL || "mongodb://betabot:MickieRocks123@linus.mongohq.com:10016/chill_bot", {
			server: {
				auto_reconnect: true
			}
		});
	});

	bot.db.on("reconnected", function () {
		log("info", "BOT", "MongoDB reconnected!");
	});
	require("./models")(bot, mongoose);
	//function to send MOTD based off the number of songs played
	bot.sendMotd = function () {
		bot.db.models.Settings.findOne({
			id: "s3tt1ng5"
		}, function (err, doc) {
			if (doc) {
				doc.songCount++;
				doc.save();
				if (doc.motd.enabled) {
					if (doc.songCount % doc.motd.interval === 0) {
						bot.sendChat(bot.identifier + doc.motd.msg);
					}
				}
			} else {
				doc = {
					id: "s3tt1ng5",
					motd: {
						msg: "",
						interval: 15,
						enabled: false
					},
					emoji: {
						paused: false,
						reset: false
					},
					songCount: 0
				};
				doc.songCount++;
				bot.db.models.Settings.create(doc, function (err, doc) {
					if (err) {
						log("error", "BOT", err);
					}
					if (doc) {
						return doc;
					}
				});
			}
			if (err) {
				log("error", "BOT", err);
			}
		});
	};
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
					switch (typeof (commands[data.trigger])) {
						case "string":
							bot.sendChat(bot.identifier + commands[data.trigger]);
							break;
						case "function":
							//little trick to give the commands the bot to use its functions and also the data from the chat
							commands[data.trigger].apply(bot, [data]);
							break;
					}
				}
			}
			//check to see if any of the words match an emoji
			else if (bot.emojis.indexOf(token) > -1) {
				//if it does, find or create db entery, incrementing the count
				bot.db.models.EmojiCount.findOne({
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
						bot.db.models.EmojiCount.create(doc, function (err, doc) {
							if (err) {
								log("error", "BOT", err);
							}
						});
					}
					if (err) {
						log("error", "BOT", err);
					}
				});
			}
		});
		//DB store
		//only storing the chat ID's, user IDs, and username so that the DB file doesn't get too big yo!
		var chatSchema = {
			username: data.user.username,
			chatid: data.raw.chatid
		};
		bot.db.models.Chat.create(chatSchema, function (err, chat) {
			if (err) {
				log("error", "BOT", err);
			}
		});
	});
	bot.on("room_playlist-update", function (data) {
		bot.sendMotd();
		var date = new Date();
		//for the off chance that the bot is started for the first time during a period where it needs to track emojis
		//need to set a time out to make sure the settings in bot.sendMotd() has been created.
		setTimeout(function () {
			//checks to see if it's within the first hour of the day
			if (date.getHours() === 2) {
				if (date.getDay() === 1) {
					bot.db.models.Settings.findOne({
						id: "s3tt1ng5"
					}, function (err, doc) {
						if (err) {
							log("error", "BOT", err);
						}
						if (!doc.emoji.paused) {
							var emojis = [];
							bot.emojis.forEach(function (emoji, index, arr) {
								if (index === arr.length - 1) {
									setTimeout(function () {
										bot.db.models.EmojiTrackDays.create({
											emojis: emojis
										}, function (err, doc) {
											if (err) {
												log("error", "BOT", err);
											}

										});
									}, 5000);
								} else {
									bot.db.models.EmojiCount.findOne({
										emoji: emoji
									}, function (err, doc) {
										if (err) {
											log("error", "BOT", err);
										}
										if (doc) {
											var count = {
												emojiName: emoji,
												count: doc.count
											};
											emojis.push(count);
										}
									});
								}
							});
							bot.db.models.Settings.findOne({
								id: "s3tt1ng5"
							}, function (err, doc) {
								if (err) {
									log("error", "BOT", err);
								}
								doc.emoji.paused = true;
								doc.save();
							});
						}
						if (!doc.emoji.reset) {
							var emojisW = [];
							bot.emojis.forEach(function (emoji, index, arr) {
								if (index === arr.length - 1) {
									setTimeout(function () {
										bot.db.models.EmojiTrackWeeks.create({
											emojis: emojisW
										}, function (err, doc) {
											if (err) {
												log("error", "BOT", err);
											}

										});
									}, 5000);
								} else {
									bot.db.models.EmojiCount.findOne({
										emoji: emoji
									}, function (err, doc) {
										if (err) {
											log("error", "BOT", err);
										}
										if (doc) {
											var count = {
												emojiName: emoji,
												count: doc.count
											};
											emojisW.push(count);
											doc.count = 0;
											doc.save();
										}
									});
								}
							});
							bot.db.models.Settings.findOne({
								id: "s3tt1ng5"
							}, function (err, doc) {
								if (err) {
									log("error", "BOT", err);
								}
								doc.emoji.reset = true;
								doc.save();
							});
						}

					});
				} else {
					bot.db.models.Settings.findOne({
						id: "s3tt1ng5"
					}, function (err, doc) {
						if (err) {
							log("error", "BOT", err);
						}
						if (!doc.emoji.paused) {
							var emojis = [];
							bot.emojis.forEach(function (emoji, index, arr) {
								if (index === arr.length - 1) {
									setTimeout(function () {
										bot.db.models.EmojiTrackDays.create({
											emojis: emojis
										}, function (err, doc) {
											if (err) {
												log("error", "BOT", err);
											}

										});
									}, 5000);
								} else {
									bot.db.models.EmojiCount.findOne({
										emoji: emoji
									}, function (err, doc) {
										if (err) {
											log("error", "BOT", err);
										}
										if (doc) {
											var count = {
												emojiName: emoji,
												count: doc.count
											};
											emojis.push(count);
										}
									});
								}
							});
							bot.db.models.Settings.findOne({
								id: "s3tt1ng5"
							}, function (err, doc) {
								if (err) {
									log("error", "BOT", err);
								}
								doc.emoji.paused = true;
								doc.save();
							});
						}
						if (doc.emoji.reset) {
							bot.db.models.Settings.findOne({
								id: "s3tt1ng5"
							}, function (err, doc) {
								if (err) {
									log("error", "BOT", err);
								}
								doc.emoji.reset = false;
								doc.save();
							});
						}
					});
				}
			} else {
				bot.db.models.Settings.findOne({
					id: "s3tt1ng5"
				}, function (err, doc) {
					if (err) {
						log("error", "BOT", err);
					}
					if (doc.emoji.paused) {
						doc.emoji.paused = false;
						doc.save();
					}
				});
			}
		}, 5000);
	});
	log("info", "BOT", "DubAPI Version: " + bot.version);

	function connect() {
		bot.connect(config.roomURL);
	}

	bot.on("connected", function (name) {
		bot.sendChat(bot.identifier + "online! ver: " + pkg.version);
		log("info", "BOT", "Bot Version: " + pkg.version);
		log("info", "BOT", "Connected to " + name);
	});

	bot.on("disconnected", function (name) {
		log("warning", "BOT", "Disconnected from " + name);
		setTimeout(connect, 15000);
	});

	bot.on("error", function (err) {
		log("error", "BOT", err);
	});
	connect();
});
