const DubAPI = require("dubapi");
const log = require("jethro");
const pkg = require(process.cwd() + "/package.json");
const config = require(process.cwd() + "/config");
const Fs = require("fs");

log.setUTC(true);

new DubAPI({
	username: config.bot.name,
	password: config.bot.pass
}, function(err, bot) {
	if (err) {
		return log("error", "BOT", err);
	}

	/* Logs a simple RethinkDB error */
	bot.errLog = err => {
		if (err) {
			bot.log("error", "RETHINK", err);
			return true;
		}
		return false;
	};

	// setup logger
	bot.log = require("jethro");
	bot.log.setUTC(true);

	bot.log("info", "BOT", "DubAPI Version: " + bot.version);
	bot.on("connected", name => {
		// bot.sendChat(bot.identifier + "online! ver: " + pkg.version);
		bot.log("info", "BOT", "Bot Version: " + pkg.version);
		bot.log("info", "BOT", "Bot connected to: " + name);
		bot.log("info", "BOT", "Bot ID: " + bot._.self.id);
		bot.dubtrackReady = true;
		onReady(bot);
	});

	bot.on("disconnected", name => {
		bot.log("error", "BOT", "Disconnected from " + name);
		process.exitCode = 1;
	});
	bot.on("error", function(err) {
		bot.log("error", "BOT", err);
		process.exitCode = 1;
	});

	require("./db.js")(bot.log, conn => {
		bot.rethink = conn;
		onReady(bot);
	});
	
	// connect
	bot.connect(config.bot.URL);

	// setup > mod ranks
	bot.ranks = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001"];

	// setup > vip ranks
	bot.vips = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001", "5615fe1ee596154fc2000001"];

	// setup devs
	bot.devs = [];

	// setup bot.identifier
	bot.identifier = "";

	// setup protection for double skips
	bot.protection = false;

	// stop bot from inputting song/history twice
	bot.started = false;

	module.exports = bot;
});

var started = false;
function onReady(bot) {
	if (started) {
		return bot.log("warning", "loader", "Trying to start when already started");
	}

	if (bot.rethink == null) {
		return bot.log("warning", "loader", "RethinkDB isn't ready");
	}
	if (bot.dubtrackReady == null) {
		return bot.log("warning", "loader", "Dubtrack isn't ready");
	}
	bot.log("info", "loader", "We are ready!");
	started = true;

	const baseDir = process.cwd() + "/bot/";
	const folders = ["events"];
	for (var i = folders.length - 1; i >= 0; i--) {
		const dir = baseDir + folders[i];
		Fs.readdirSync(dir).forEach(file => {
			if (file.indexOf(".js") > -1) {
				require(dir + "/" + file)(bot);
			}
		});
	}

	require("./motd.js").init(bot);
	require("./raffle.js").init(bot);
}
