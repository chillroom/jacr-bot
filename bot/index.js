const config = require(process.cwd() + "/config");
const DubAPI = require("dubapi");
const log = require("jethro");
const Fs = require("fs");
const request = require('request');
const db = require("./lib/db");
const MOTD = require("./motd.js");

log.setUTC(true);

new DubAPI({
	username: config.bot.name,
	password: config.bot.pass,
}, function(err, bot) {
	/* eslint no-param-reassign: ["error", { "props": false }]*/

	if (config.google_api_key == null) {
		bot.sendChat("YouTube checking is not enabled.");
	}

	if (config.soundcloud_api_key == null) {
		bot.sendChat("Soundcloud checking is not enabled.");
	}

	if (err) {
		return log("error", "BOT", err);
	}

	/* Logs a simple Postgres error */
	bot.errLog = err => {
		if (err) {
			bot.log("error", "POSTGRES", err);
			return true;
		}
		return false;
	};

	bot.dbLog = reason => {
		return (error) => { return bot.checkError(error, "pgsql", reason); };
	};

	bot.checkError = (err, realm, reason) => {
		if (err) {
			bot.log("error", realm, reason);
			bot.log("error", realm, err.toString());
			return true;
		}

		return false;
	};

	bot.util = {};
	bot.util.getUserIDFromName = function(name, callback) {
		const u = bot.getUserByName(name, true);
		if (u != null) {
			callback(null, u.id);
			return;
		}

		request({
			url: "https://api.dubtrack.fm/user/" + name,
			json: true,
		}, (error, response, body) => {
			if (error != null || response.statusCode !== 200) {
				if (response.statusCode !== 404) {
					bot.log("error", "getUserIDFromName", err);
					callback(error);
					return;
				}

				callback("error 404");
				return;
			}

			callback(null, body.data.userInfo.userid);
		});
	};

	bot.util.updateUser = (dubid, username, type, message, cb) => {
		let callback = cb;
		if (callback == null) {
			callback = bot.dbLog(`Internal error: could not update status for @${username}.`);
		}

		db.query(
			`
			INSERT INTO
			dubtrack_users(dub_id, username, seen_time, seen_type, seen_message)
			VALUES ($1, $2, now(), $3, $4)
			ON CONFLICT(dub_id) DO UPDATE SET username = $2, seen_time = now(), seen_type = $3, seen_message = $4
			RETURNING id
			`,
			[dubid, username, type, message],
			cb
		);
	};

	// setup logger
	bot.log = require("jethro");
	bot.log.setUTC(true);

	bot.log("info", "BOT", "DubAPI Version: " + bot.version);
	bot.on("connected", name => {
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
	
	// connect
	bot.connect(config.bot.URL);

	// setup > mod ranks
	bot.ranks = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001"];

	// setup > vip ranks
	bot.vips = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001", "5615fe1ee596154fc2000001"];

	// setup protection for double skips
	bot.protection = false;

	// stop bot from inputing song/history twice on first join (current song would be sent, and triggered twice)
	bot.started = false;

	bot.readUsers = function readUsers(users, convertToIDs) {
		const unseenUsers = users.slice();

		// if convertToIDs has any value, use the bot to
		// check if the user is in the room
		const outUsers = [];

		for (const user of bot.getUsers()) {
			// if found, remove from unseen!
			const index = unseenUsers.indexOf(`@${user.username}`);
			if (index > -1) {
				unseenUsers.splice(index, 1);
				outUsers.push((convertToIDs === true) ? user.id : user.username);
			}

			if (unseenUsers.length === 0) {
				break;
			}
		}

		if (unseenUsers.length > 0) {
			bot.sendChat(`Operation not completed. Could not find: ${unseenUsers.join(", ")}`);
			return false;
		}

		return outUsers;
	};

	bot.sendChatTemp = (msg, cb, time) => {
		bot.sendChat(msg, (code, resp) => {
			let del = true;
			if (cb != null) {
				del = cb(code, resp);
			}
			
			// IF THERE IS A CALLBACK
			// IT MUST RETURN TRUE, TO DELETE THE CHAT
			if (!del) {
				return;
			}

			const id = resp.data.chatid;
			setTimeout(chatid => {
				bot.moderateDeleteChat(chatid);
			}, time, id);
		});
	};

	module.exports = bot;
});

let started = false;
function onReady(bot) {
	if (started) {
		return bot.log("warning", "loader", "Trying to start when already started");
	}
	if (bot.dubtrackReady == null) {
		return bot.log("warning", "loader", "Dubtrack isn't ready");
	}

	bot.log("info", "loader", "We are ready!");

	started = true;

	const folders = ["events"];
	const base = `${process.cwd()}/bot/`;
	for (let i = folders.length - 1; i >= 0; i--) {
		const dir = base + folders[i];
		Fs.readdirSync(dir).forEach(file => {
			if (file.indexOf(".js") > -1) {
				require(`${dir}/${file}`)(bot);
			}
		});
	}

	bot.motd = new MOTD(bot);
	require("./raffle.js").init(bot);
	require("./event.js").init(bot);
	require("./karma.js").init(bot);
	// require("./tell.js").init(bot); // Disabled for a rewrite surrounding IDs
	require("./test.js").init(bot);
	require("./art.js").init(bot);
	require("./hangman.js").init(bot);
	return true;
}
