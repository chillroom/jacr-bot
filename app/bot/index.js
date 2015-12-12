var DubAPI = require("dubapi"),
	mongoose = require("mongoose"),
	log = require("jethro"),
	pkg = require(process.cwd() + "/package.json"),
	config = require(process.cwd() + "/config");

log.setUTC(true);

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

	function connect() {
		bot.connect(config.roomURL);
	}
	bot.log("info", "BOT", "DubAPI Version: " + bot.version);
	bot.on("connected", function (name) {
		bot.sendChat(bot.identifier + "online! ver: " + pkg.version);
		bot.log("info", "BOT", "Bot Version: " + pkg.version);
		bot.log("info", "BOT", "Bot connected to: " + name);
		bot.log("info", "BOT", "Bot ID: " + bot._.self.id);
		if (bot._.room.users.findWhere({
			id: bot._.self.id
		}, true) === "undefined") {
			bot.log("warning", "BOT", "Bot not in room");
		}
		if (bot._.room.users.findWhere({
			id: bot._.self.id
		}, true) === undefined) {
			bot.log("warning", "BOT", "Bot not in room");
		}
		var users = bot.getUsers();
		users.forEach(function (user) {
			if (typeof (user.id) !== "undefined") {
				bot.db.models.person.findOne({
					uid: user.id
				}, function (err, person) {
					if (err) {
						bot.log("error", "BOT", err);
					} else {
						if (!person) {
							var doc = {
								username: user.username,
								uid: user.id,
								dubs: user.dubs
							};
							person = new bot.db.models.person(doc);
						}
						var moderator = {
							isMod: false
						};
						if (bot.isMod(user)) {
							moderator["type"] = "mod";
							moderator["isMod"] = true;
						} else if (bot.isManager(user)) {
							moderator["type"] = "manager";
							moderator["isMod"] = true;
						} else if (bot.isOwner(user)) {
							moderator["type"] = "co-owner";
							moderator["isMod"] = true;
						}
						if (moderator.isMod) {
							person.rank.name = moderator.type;
							person.rank.rid = user.role;
							person.save();
						}
					}
				});
			}
		});
	});
	bot.on("disconnected", function (name) {
		bot.log("warning", "BOT", "Disconnected from " + name);
		setTimeout(connect, 15000);
	});
	bot.on("error", function (err) {
		bot.log("error", "BOT", err);
	});
	connect();
	//setup db
	mongoose.connect(config.mongoURL, {
		server: {
			auto_reconnect: true
		}
	});
	bot.db = mongoose.connection;
	bot.db.on("error", function (err) {
		bot.log("error", "BOT", "MongoDB connection error:" + err);
	});
	bot.db.on("connected", function () {
		bot.log("info", "BOT", "MongoDB connected!");
	});
	bot.db.on("disconnected", function () {
		bot.log("warning", "BOT", "MongoDB disconnected!");
		mongoose.connect(config.mongoURL, {
			server: {
				auto_reconnect: true
			}
		});
	});
	bot.db.on("reconnected", function () {
		bot.log("info", "BOT", "MongoDB reconnected!");
	});
	//setup > mod ranks
	bot.ranks = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001"];
	//setup > vip ranks
	bot.vips = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001", "5615fe1ee596154fc2000001"];
	//setup devs
	bot.devs = ["tigerpancake", "mclovinthesex", "nitroghost"];
	//setup bot.identifier
	bot.identifier = ":white_small_square: ";
	//setup protection for double skips
	bot.protection = false;
	//stop bot from inputting song/history twice
	bot.started = false;
	//setup emojis
	bot.emojis = require("./emojis");
	require("./models")(bot, mongoose);
	//setup function to send MOTD based off the number of songs played
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
	require("./events")(bot);
});
