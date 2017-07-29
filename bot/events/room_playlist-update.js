const moment = require("moment");
const sprintf = require("sprintf-js").sprintf;
const request = require("request");
const db = require("../lib/db");
const EventManager = require("../event.js");
const config = require("../../config");

let bot;

function onUpdateLastfm(data) {
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

		execFile("/home/qaisjp/jacr/jacr-bot/bot/events/lastfm", [json], { env: config.lastfm }, (err) => {
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

	db.query(
		`
		WITH
			u as (SELECT id FROM dubtrack_users WHERE dub_id = $1)
		INSERT INTO history (dub_id, song, "user")
		VALUES ($2, $3, (SELECT id from u))
		`,
		[data.user.id, data.id, songID],
		bot.dbLog("Could not insert new played song into history.")
	);
}

function checkYouTube(song, shouldSkip, skip) {
	if (config.google_api_key == null) {
		return;
	}

	request(
		{
			url: "https://www.googleapis.com/youtube/v3/videos",
			qs: {
				part: 'status',
				key: config.google_api_key,
				id: song.fkid,
			},
			method: "GET",
			json: true,
		},
		(error, response, body) => {
			if ((error != null) || (response.statusCode !== 200)) {
				bot.checkError(error, "error", "could not query YouTube API for song data");
				bot.log("error", "youtube", error);
				if (response != null) {
					bot.log('error', 'youtube', `Status code: ${response.statusCode}`);
				}
				bot.sendChat("Could not query YouTube API for song data.");
				return;
			}

			let availability = true;

			if ((body.pageInfo.totalResults === 0) || (body.items[0] == null)) {
				// handle non exist / private situation
				availability = false;
			} else if (body.items[0].status.uploadStatus === "rejected") {
				availability = false;
			}

			if (!availability) {
				bot.sendChat("This track appears to be unavailable. Please pick another track.");
				if (shouldSkip) {
					skip(null, true);
				}
			}
		}
	);
}

function checkSoundCloud(song, shouldSkip, skip) {
	if (config.soundcloud_api_key == null) {
		return;
	}

	// Please do not use the client_id from the repository history. That API key is tied to a personal account.
	request(`https://api.soundcloud.com/tracks/${song.fkid}?client_id=${config.soundcloud_api_key}`, (error, response, unparsedBody) => {
		if (error != null) {
			bot.checkError(error, "error", "could not query soundcloud API for song data");
			bot.log("error", "soundcloud", error);
			if (response != null) {
				bot.log('error', 'soundcloud', `Status code: ${response.statusCode}`);
			}
			bot.sendChat("Could not query YouTube API for song data.");
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

		// bot.sendChat(`This song has just been auto-retagged as "${newTitle}"`);

		db.query(
			"UPDATE songs SET autoretagged = true, name = $2 WHERE id = $1",
			[song.id, newTitle],
			bot.dbLog("Could not update autoretag via Soundcloud")
		);
	});
}

function onUpdateLog(err, data, results) {
	if (bot.checkError(err, "pgpsql", "could not select song data")) {
		bot.sendChat("Could not update song data. Internal error, @qaisjp!");
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
	if (results.rowCount === 0) {
		db.query(
			`
			INSERT INTO
			songs(fkid, type, name, last_play, skip_reason, total_plays, recent_plays)
			VALUES
			($1, $2, $3, now(), null, 1, 1)
			RETURNING id
			`,
			[data.media.fkid, data.media.type, data.media.name],
			(err, res) => {
				if (bot.checkError(err, "pgsql", "Could not insert new song.")) {
					bot.sendChat("Could not insert new song, internal error, @qaisjp!");
					return;
				}

				const songID = res.rows[0].id;

				// Get the song ID and add it to the history
				addSongToHistory(data, songID);

				checkAvailability(true, { id: songID, type: data.media.type, fkid: data.media.fkid, name: data.media.name });
			}
		);

		// User has played a new song, gift them karma!
		db.query(
			"UPDATE dubtrack_users SET karma = karma + 20  where (dub_id = $1) RETURNING karma",
			[data.user.id],
			(err, res) => {
				if (bot.checkError(err, "pgsql", "Could not gift karma for new song")) {
					bot.sendChat("Internal error on gifting karma for a new song.");
					return;
				}

				if (res.rowCount === 0) {
					bot.sendChat("Karma was not awarded for some reason.");
					return;
				}

				bot.sendChatTemp(`${data.user.username} has been rewarded 20 karma for playing a new track, and is now at ${res.rows[0].karma} karma!`, null, 60000); // 60000ms = 1 minute
			}
		);

		return;
	}

	const song = results.rows[0];

	// adds the song to the history
	addSongToHistory(data, song.id);

	let skipReason = null;
	let shouldLockskip = false;
	if (song.skip_reason === "forbidden") {
		skipReason = "Song has been recently flagged as forbidden. You can view the op/forbidden list here: http://just-a-chill-room.net/op-forbidden-list/";
	} else if (song.skip_reason === "nsfw") {
		skipReason = "Song has been recently flagged as NSFW";
	} else if (song.skip_reason === "unavailable") {
		skipReason = "Song has been recently flagged as unavailable for all users. Please pick another song";
		shouldLockskip = true;
	} else if (song.skip_reason === "theme") {
		skipReason = "Song has been recently flagged as not on theme. You can view the theme here: http://just-a-chill-room.net/rules/#theme";
	}

	if (skipReason != null) {
		skip(skipReason, shouldLockskip);
		return;
	}

	// OP checker
	const isOldSong = moment(song.last_play).add(2, 'months').isBefore();

	if (song.recent_plays > 10 && !isOldSong) {
		botLogUser('info', 'ROOM', '%s is playing an OP song', data.user);
		skip('This song appears to be overplayed. Please pick another song.', true);
		checkAvailability(false, song); // skip = false
		return;
	}

	const update = {
		recentPlays: isOldSong ? 1 : 'recent_plays + 1',
		totalPlays: 'total_plays + 1',
		retagged: (data.media.name === song.name) ? false : !song.autoretagged,
	};

	// if (update.retagged) {
	// 	bot.sendChat(`This song was previously retagged as "${song.name}"`);
	// } else if (song.autoretagged) {
	// 	bot.sendChat(`This song was previously auto-retagged as "${song.name}"`);
	// }

	db.query(
		`UPDATE songs SET recent_plays = ${update.recentPlays}, total_plays = ${update.totalPlays}, last_play = now(), retagged = $2 WHERE id = $1`,
		[
			song.id, // id
			update.retagged,
		],
		bot.dbLog("Could not update song data on play")
	);

	checkAvailability(true, song);
}

function onUpdate(data) {
	bot.motd.onAdvance();

	if (!bot.started) {
		bot.started = true;
		return;
	}
	onUpdateLastfm(data);
	EventManager.onAdvance(data.lastPlay ? data.lastPlay.user : null, data.user);

	// Update the previous song score
	if (data.lastPlay != null) {
		db.query(
			"UPDATE history SET score_up = $2, score_grab = $3, score_down = $4 WHERE dub_id = $1",
			[data.lastPlay.id, data.lastPlay.score.updubs, data.lastPlay.score.grabs, data.lastPlay.score.downdubs],
			bot.dbLog("Could not update score of previously played song.")
		)
		
	}

	if (data.media == null) {
		return;
	}

	botLogUser("info", "ROOM", "%s is now playing", data.user);

	// First we get the song that matches the fkid/type
	db.query(
		"SELECT * FROM songs WHERE fkid = $1 and type = $2",
		[data.media.fkid, data.media.type],
		(err, results) => onUpdateLog(err, data, results)
	);
}

module.exports = receivedBot => {
	bot = receivedBot;

	bot.on("room_playlist-update", onUpdate);
};
