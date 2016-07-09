"use strict";

var moment = require("moment");
var sprintf = require("sprintf-js").sprintf;
var MOTD = require("../motd.js");
var r = require("rethinkdb");
var bot;

module.exports = receivedBot => {
	bot = receivedBot;
	bot.on("room_playlist-update", onUpdate);
};

/* Logs a simple RethinkDB error */
function errLog(err) {
	if (err) {
		bot.log("error", "RETHINK", err);
		return true;
	}
	return false;
}

function onUpdate(data) {
	MOTD.onAdvance();

	if (!bot.started) {
		bot.started = true;
		return;
	}
	onUpdateLastfm(bot, data);

	if (data.lastPlay != null) {
		r
			.table("history")
			.filter({platform: "dubtrack", platformID: data.lastPlay.id})
			.orderBy(r.desc("time"))
			.limit(1)
			.update({
				score: {
					up: data.lastPlay.score.updubs,
					grab: data.lastPlay.score.grabs,
					down: data.lastPlay.score.downdubs
				}
			})
			.run(bot.rethink, errLog);
	}

	if (data.media == null) {
		return;
	}

	botLogUser(bot, "info", "ROOM", "%s is now playing", data.user);

	// First we get "all" the songs that match the fkid
	r
		.table('songs')
		.getAll(data.media.fkid, {index: "fkid"})
		.filter({type: data.media.type}) // and the same type
		.run(bot.rethink, function(err, cursor) {
			if (errLog(err)) {
				return;
			}

			cursor.toArray().then(results => {
				onUpdateLog(data, results);
			}).error(errLog);
		});
}

function botLogUser(bot, mode, scope, message, user) {
	if (user == null) {
		user = {
			username: "?",
			id: "?"
		};
	}

	var username = sprintf("%s (%s)", user.id, user.username);
	bot.log(mode, scope, sprintf(message, username));
}

function onUpdateLastfm(bot, data) {
	const config = require(process.cwd() + "/config");
	if (config.lastfm.LFM_APIKEY == null) {
		return;
	}
	
	var result = {};

	if (data.lastPlay != null && data.lastPlay.media != null) {
		result.scrobble = {
			title: data.lastPlay.media.name,
			duration: data.lastPlay.media.songLength / 1000
		};
	}
	
	if (data.media != null) {
		result.nowPlaying = {
			title: data.media.name,
			duration: data.media.songLength / 1000
		};
	}

	if (result.scrobble || result.nowPlaying) {
		var json = JSON.stringify(result);
		const execFile = require('child_process').execFile;
		execFile("/home/qaisjp/jacr/illumibot/bot/events/lastfm", [json], {env: config.lastfm}, (err, stdout) => {
			if (err != null) {
				bot.log("debug", "lastfm_err", err);
			}
		});
	}
}

function addSongToHistory(data, songID) {
	// Only do if the user exists
	if (data.user == null) {
		return;
	}

	// Get their rethink user ID
	r.table("users").filter({uid: "5606975b9f38870300fba19e", platform: "dubtrack"})("id").run(bot.rethink)
		.then(result => result.toArray())
		.error(errLog)
		.then(function(results) {
			// If it exists (it should), add it to the history
			if (results[0] == null) {
				errLog("No user with that UID: " + data.user.id);
				return;
			}
			
			let item = {
				song: songID,
				time: r.now(),
				person: results[0],
				
				platform: "dubtrack",
				platformID: data.id,

				score: {
					up: 0,
					grab: 0,
					down: 0
				}
			};

			return r.table("history").insert(item).run(bot.rethink, errLog);
		})
		.error(errLog);
}

function onUpdateLog(data, results) {
	var song = results[0];
	if (results.length > 1) {
		errLog(song.fkid + " song multple existence");
		return;
	}

	// If there is no song, create a new song
	if (song == null) {
		let song = {
			fkid: data.media.fkid,
			name: data.media.name,
			type: data.media.type,
			lastPlay: r.now(),
			skipReason: null,
			plays: 1
		};

		r.table("songs").insert(song).run(bot.rethink, function(err, result) {
			if (errLog(err)) {
				return;
			}

			// Get the song ID
			var songID = result.generated_keys[0];
			addSongToHistory(data, songID);
		});

		return;
	}

	// adds the song to the history
	addSongToHistory(data, song.id);

	const skip = (msg, move) => {
		bot.moderateSkip(() => {
			bot.sendChat(msg);
			botLogUser(bot, "info", "ROOM", "%s has been skipped", data.user);
			if (move) {
				bot.once("room_playlist-queue-update-dub", () => {
					if (data.user != null) {
						bot.moderateMoveDJ(data.user.id, 1);
					}
					botLogUser(bot, "info", "ROOM", "%s has been moved to the front", data.user);
				});
			}
		});
	};

	var skipReason = null;
	var shouldLockskip = false;
	if (song.skipReason === "forbidden") {
		skipReason = "Song has been recently flagged as forbidden. You can view the op/forbidden list here: http://just-a-chill-room.net/op-forbidden-list/";
	} else if (song.skipReason === "nsfw") {
		skipReason = "Song has been recently flagged as NSFW";
	} else if (song.skipReason === "unavailable") {
		skipReason = "Song has been recently flagged as unavailable for all users. Please pick another song";
		shouldLockskip = true;
	} else if (song.skipReason === "theme") {
		skipReason = "Song has been recently flagged as not on theme. You can view the theme here: http://just-a-chill-room.net/rules/#theme";
	}

	if (skipReason != null) {
		skip(skipReason, shouldLockskip);
		return;
	}

	// OP checker
	r.table("songs").filter(r.row.getField("plays").gt(4)).avg("plays").default(100)
		.run(bot.rethink)
		.then(avgPlays => {
			const nextAllowed = moment(song.lastPlay).add(14, "days");

			if (song.plays > avgPlays && !moment(nextAllowed).isBefore()) {
				botLogUser(bot, "info", "ROOM", "%s is playing an OP song", data.user);
				skip("This song appears to be overplayed. Please pick another song.", true);
				return;
			}

			r.table("songs").get(song.id).update({
				plays: r.row("plays").add(1),
				lastPlay: r.now()
			}).run(bot.rethink, errLog);
		})
		.error(errLog);
}
