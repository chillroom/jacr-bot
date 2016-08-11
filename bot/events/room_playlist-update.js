const moment = require("moment");
const sprintf = require("sprintf-js").sprintf;
const request = require("request");
const MOTD = require("../motd.js");
const EventManager = require("../event.js");
let r;
let bot;

function onUpdateLastfm(data) {
	const config = require(process.cwd() + "/config");
	if (config.lastfm.LFM_APIKEY == null) {
		return;
	}
	
	const result = {};

	if (data.lastPlay != null && data.lastPlay.media != null) {
		result.scrobble = {
			title: data.lastPlay.media.name,
			duration: data.lastPlay.media.songLength / 1000,
		};
	}
	
	if (data.media != null) {
		result.nowPlaying = {
			title: data.media.name,
			duration: data.media.songLength / 1000,
		};
	}

	if (result.scrobble || result.nowPlaying) {
		const json = JSON.stringify(result);
		const execFile = require('child_process').execFile;
		execFile("/home/qaisjp/jacr/illumibot/bot/events/lastfm", [json], { env: config.lastfm }, (err) => {
			if (err != null) {
				bot.log("debug", "lastfm_err", err);
			}
		});
	}
}

function botLogUser(mode, scope, message, inputUser) {
	let user = inputUser;
	if (user == null) {
		user = {
			username: "?",
			id: "?",
		};
	}

	bot.log(mode, scope, sprintf(message, `${user.id} (${user.username})`));
}

function addSongToHistory(data, songID) {
	// Only do if the user exists
	if (data.user == null) {
		return;
	}

	// Get their rethink user ID
	r.table("users").filter({ uid: data.user.id, platform: "dubtrack" })("id").run()
		.then(results => {
			// If it exists (it should), add it to the history
			if (results[0] == null) {
				bot.errLog(`No user with that UID: ${data.user.id}`);
				return null;
			}
			
			const item = {
				song: songID,
				time: r.now(),
				user: results[0],
				
				platform: "dubtrack",
				platformID: data.id,

				score: null,
			};

			return r.table("history").insert(item).run().error(bot.errLog);
		})
		.error(bot.errLog);
}

function checkYouTube(song, shouldSkip, skip) {
	request(`https://www.googleapis.com/youtube/v3/videos?part=status&key=***REMOVED***&id=${song.fkid}`, (error, response, unparsedBody) => {
		if ((error != null) || (response.statusCode !== 200)) {
			return;
		}

		let availability = true;
		const body = JSON.parse(unparsedBody);

		if (body.pageInfo.totalResults === 0) {
			// handle non exist / private situation
			availability = false;
		} else if (body.items[0].status.uploadStatus === "rejected") {
			availability = false;
		}

		if (!availability) {
			bot.sendChat("This song appears to be unavailable. Please pick another song.");
			if (shouldSkip) {
				skip(null, true);
			}
		}
	});
}

function checkSoundCloud(song, shouldSkip, skip) {
	request(`https://api.soundcloud.com/tracks/${song.fkid}?client_id=***REMOVED***`, (error, response, unparsedBody) => {
		if (error != null) {
			return;
		}

		if (response.statusCode === 403 || response.statusCode === 404) {
			bot.sendChat("This song appears to be unavailable. Please pick another song.");
			if (shouldSkip) {
				skip(null, true);
			}
			return;
		}

		if (response.statusCode !== 200) {
			return;
		}

		if (song.retagged === true || song.autoretagged === true) {
			return;
		}

		if (song.name.indexOf("-") > -1) {
			// the song contains a "-"
			return;
		}

		const body = JSON.parse(unparsedBody);
		const newTitle = `${body.user.username} - ${body.title}`;

		bot.sendChat(`This song has been auto-retagged as "${newTitle}"`);

		r.table('songs').get(song.id).update({
			autoretagged: true,
			name: newTitle,
		}).
		run().
		error(bot.errLog);
	});
}

function onUpdateLog(data, results) {
	if (results.length > 1) {
		bot.errLog(`${results[0].fkid} song multiple existence`);
		return;
	}

	const skip = (msg, move) => {
		// don't skip if an event is active
		if (EventManager.isActive()) {
			return;
		}

		bot.moderateSkip(() => {
			if (msg != null) {
				bot.sendChat(msg);
			}

			botLogUser("info", "ROOM", "%s has been skipped", data.user);
			if (move) {
				bot.once("room_playlist-queue-update-dub", () => {
					if (data.user != null) {
						bot.moderateMoveDJ(data.user.id, 1);
					}
					botLogUser("info", "ROOM", "%s has been moved to the front", data.user);
				});
			}
		});
	};

	const checkAvailability = (shouldSkip, song) => {
		if (data.media.type === "youtube") {
			checkYouTube(song, shouldSkip, skip);
		} else if (data.media.type === "soundcloud") {
			checkSoundCloud(song, shouldSkip, skip);
		}
	};

	// If there is no song, create a new song
	if (results.length === 0) {
		const song = {
			fkid: data.media.fkid,
			name: data.media.name,
			type: data.media.type,
			lastPlay: r.now(),
			skipReason: null,
			totalPlays: 1,
			recentPlays: 1,
		};

		r.table("songs").insert(song).run().then(result => {
			// Get the song ID and add it to the history
			addSongToHistory(data, result.generated_keys[0]);

			song.id = result.generated_keys[0];
			checkAvailability(true, song);
		}).
		error(bot.errLog);

		return;
	}

	const song = results[0];

	// adds the song to the history
	addSongToHistory(data, song.id);

	let skipReason = null;
	let shouldLockskip = false;
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
		botLogUser('info', 'ROOM', '%s is playing an OP song', data.user);
		skip('This song appears to be overplayed. Please pick another song.', true);
		checkAvailability(false, song); // skip = false
		return;
	}

	const update = {
		recentPlays: isOldSong ? 1 : r.row('recentPlays').add(1),
		totalPlays: r.row('totalPlays').add(1),
		lastPlay: r.now(),
		retagged: (data.media.name === song.name) ? false : !song.autoretagged,
	};

	if (update.retagged) {
		bot.sendChat(`This song is retagged as "${song.name}"`);
	} else if (song.autoretagged) {
		bot.sendChat(`This song is auto-retagged as "${song.name}"`);
	}

	r.table('songs').get(song.id).update(update).run().
		error(bot.errLog);

	checkAvailability(true, song);
}

function onUpdate(data) {
	MOTD.onAdvance();

	if (!bot.started) {
		bot.started = true;
		return;
	}
	onUpdateLastfm(data);

	if (data.lastPlay != null) {
		r
			.table("history")
			.filter({ platform: "dubtrack", platformID: data.lastPlay.id })
			.orderBy(r.desc("time"))
			.limit(1)
			.update({
				score: {
					up: data.lastPlay.score.updubs,
					grab: data.lastPlay.score.grabs,
					down: data.lastPlay.score.downdubs,
				},
			})
			.run().
			error(bot.errLog);
	}

	if (data.media == null) {
		return;
	}

	botLogUser("info", "ROOM", "%s is now playing", data.user);

	// First we get "all" the songs that match the fkid
	r
		.table('songs')
		.getAll(data.media.fkid, { index: "fkid" })
		.filter({ type: data.media.type }) // and the same type
		.run().
		then(results => onUpdateLog(data, results)).
		error(bot.errLog);
}

module.exports = receivedBot => {
	bot = receivedBot;
	r = bot.rethink;
	bot.on("room_playlist-update", onUpdate);
};
