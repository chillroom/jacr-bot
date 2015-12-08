var DubAPI = require("dubapi"),
	mongoose = require("mongoose"),
	log = require("jethro"),
	pkg = require("../../package.json"),
	config = require("../../config");

log.setUTC(true);

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
	//setup logger
	bot.log = require("jethro");
	bot.log.setUTC(true);
	// purps array has now become bot.ranks array, so that it is easier to use within the commands
	bot.ranks = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001"];
	//if want to give vip perm, use this instead of ranks
	bot.vips = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001", "5615fe1ee596154fc2000001"];
	bot.devs = ["tigerpancake", "mclovinthesex", "nitroghost"];
	bot.identifier = ":white_small_square: ";
	//added protection to protect against double skips
	bot.protection = false;
	//added array of emojis to bot
	bot.emojis = require("./emojis");
	//added DB to bot
	bot.db = mongoose.connection;
	bot.db.on("error", function (err) {
		bot.log("error", "BOT", "MongoDB connection error:" + err);
	});

	bot.db.once("open", function callback() {
		bot.log("info", "BOT", "MongoDB connection is established");
	});

	bot.db.on("disconnected", function () {
		bot.log("warning", "BOT", "MongoDB disconnected!");
		mongoose.connect(process.env.MONGO_URL || "mongodb://betabot:MickieRocks123@linus.mongohq.com:10016/chill_bot", {
			server: {
				auto_reconnect: true
			}
		});
	});

	bot.db.on("reconnected", function () {
		bot.log("info", "BOT", "MongoDB reconnected!");
	});
	//
	require("./models")(bot, mongoose);
	//function to send MOTD based off the number of songs played
	bot.sendMotd = function () {
		bot.db.models.settings.findOne({
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
				bot.db.models.settings.create(doc, function (err, doc) {
					if (err) {
						bot.log("error", "BOT", err);
					}
					if (doc) {
						return doc;
					}
				});
			}
			if (err) {
				bot.log("error", "BOT", err);
			}
		});
	};

	function connect() {
		bot.connect(config.roomURL);
	}
	bot.log("info", "BOT", "DubAPI Version: " + bot.version);
	bot.on("connected", function (name) {
		bot.sendChat(bot.identifier + "online! ver: " + pkg.version);
		bot.log("info", "BOT", "Bot Version: " + pkg.version);
		bot.log("info", "BOT", "Connected to " + name);
	});

	bot.on("disconnected", function (name) {
		bot.log("warning", "BOT", "Disconnected from " + name);
		setTimeout(connect, 15000);
	});

	bot.on("error", function (err) {
		bot.log("error", "BOT", err);
	});
	require("./events")(bot);
	connect();
});
