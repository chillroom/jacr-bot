"use strict";

var moment = require("moment");
var sprintf = require("sprintf-js").sprintf;
var MOTD = require("../motd.js");
var r;
var bot;

module.exports = receivedBot => {
	bot = receivedBot;
	r = bot.rethink;
	bot.on("room_playlist-update", onUpdate);
};

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
			.run().error(bot.errLog);
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
		.run().then(results => onUpdateLog(data, results)).error(bot.errLog);
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
	r.table("users").filter({uid: data.user.id, platform: "dubtrack"})("id").run()
		.then(function(results) {
			// If it exists (it should), add it to the history
			if (results[0] == null) {
				bot.errLog("No user with that UID: " + data.user.id);
				return;
			}
			
			let item = {
				song: songID,
				time: r.now(),
				user: results[0],
				
				platform: "dubtrack",
				platformID: data.id,

				score: null
			};

			return r.table("history").insert(item).run().error(bot.errLog);
		})
		.error(bot.errLog);
}

function onUpdateLog(data, results) {
	var song = results[0];
	if (results.length > 1) {
		bot.errLog(song.fkid + " song multple existence");
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
			totalPlays: 1,
			recentPlays: 1,
		};

		r.table("songs").insert(song).run().then(function(result) {
			// Get the song ID
			var songID = result.generated_keys[0];
			addSongToHistory(data, songID);
		}).error(bot.errLog);

		return;
	}

	// adds the song to the history
	addSongToHistory(data, song.id);

	const skip = (msg, move) => {
		bot.moderateSkip(() => {
			if (msg != null) {
				bot.sendChat(msg);
			}

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


	const checkAvailability = (shouldSkip) => {
		if (data.media.type !== "youtube") {
			return;
		}

		var request = require("request");
		request("https://www.googleapis.com/youtube/v3/videos?part=status&key=***REMOVED***&id=" + data.media.fkid, function(error, response, body) {
			if ((error != null) || (response.statusCode !== 200)) {
				return;
			}

			let availability = true;

			body = JSON.parse(body);
			console.log(body)
			if (body.pageInfo.totalResults === 0) {
				// handle non exist / private situation
				availability = false;
			} else if (body.items[0].status.uploadStatus === "rejected") {
				availability = false;
			}

			if (!availability) {
				bot.sendChat("This song appears to be unavailable. Please pick another song.")
				if (shouldSkip) {
					skip(null, true)
				}
			}
		})
	}

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
	const isOldSong = moment(song.lastPlay).add(2, 'months').isBefore();

	if (song.recentPlays > 10 && !isOldSong) {
		botLogUser(bot, 'info', 'ROOM', '%s is playing an OP song', data.user);
		skip('This song appears to be overplayed. Please pick another song.', true);
		checkAvailability(false); // skip = false
		return;
	}

	r.table('songs').get(song.id).update({
		recentPlays: isOldSong ? 0 : r.row('recentPlays').add(1),
		totalPlays: r.row('totalPlays').add(1),
		lastPlay: r.now(),
	}).run().
		error(bot.errLog);

	checkAvailability(true);
}
