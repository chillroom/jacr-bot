// jshint esversion: 6
// jshint strict: true
// jshint node: true
// jshint asi: true
"use strict";

var moment = require("moment");
var sprintf = require("sprintf-js").sprintf;
var MOTD = require("../motd.js");

module.exports = bot => {
	bot.on("room_playlist-update", data => {
		onUpdate(bot, data);
	});
};

function onUpdate(bot, data) {
	MOTD.onAdvance();

	if (!bot.started) {
		bot.started = true;
		return;
	}
	onUpdateLog(bot, data);
	onUpdateLastfm(bot, data);
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
			// bot.log("debug", "lastfm_stdout", stdout)
		});
	}
}

function onUpdateLog(bot, data) {
	if (typeof data.media === "undefined") {
		return;
	}

	botLogUser(bot, "info", "ROOM", "%s is now playing", data.user);

	bot.db.models.songs.findOne({
		fkid: data.media.fkid
	}, (err, song) => {
		if (err) {
			bot.log("error", "MONGO", err);
			return;
		}
		const skip = (msg, move) => {
			bot.moderateSkip(() => {
				bot.sendChat(bot.identifier + msg);
				botLogUser(bot, "info", "ROOM", "%s has been skipped", data.user);
				if (move) {
					bot.once("room_playlist-queue-update-dub", () => {
						if (data.user != null) {
							bot.moderateMoveDJ(data.user.id, 0);
						}
						botLogUser(bot, "info", "ROOM", "%s has been moved to the front", data.user);
					});
				}
			});
		};
		if (!song) {
			const doc = {
				name: data.media.name,
				fkid: data.media.fkid,
				plays: 1,
				lastPlay: new Date()
			};
			song = new bot.db.models.songs(doc);
			song.save(() => {
				if (typeof data.user === "undefined") {
					return;
				}
				bot.db.models.person.findOne({
					uid: data.user.id
				}, (err, person) => {
					if (err) {
						bot.log("error", "MONGO", err);
						return;
					}

					if (!person) {
						const doc = {
							uid: data.user.id
						};
						person = new bot.db.models.person(doc);
					}

					person.username = data.user.username;
					person.dubs = data.user.dubs;
					person.save(() => {
						bot.db.models.history.create({
							_song: song._id,
							_person: person._id
						}, err => {
							if (err) {
								bot.log("error", "MONGO", err);
							}
						});
					});
				});
			});
			return;
		}

		if (song.forbidden) {
			setTimeout(() => {
				skip("Song has been recently flagged as forbidden. You can view the op/forbidden list here: http://just-a-chill-room.net/op-forbidden-list/");
			}, 3000);
		} else if (song.nsfw) {
			setTimeout(() => {
				skip("Song has been recently flagged as NSFW");
			}, 3000);
		} else if (song.unavailable) {
			setTimeout(() => {
				skip("Song has been recently flagged as unavailable for all users. Please pick another song", true);
			}, 3000);
		} else if (!song.theme) {
			setTimeout(() => {
				skip("Song has been recently flagged as not on theme. You can view the theme here: http://just-a-chill-room.net/rules/#theme");
			}, 3000);
		}

		const save = function(increment) {
			if (increment) {
				song.plays++;
				song.lastPlay = new Date();
			}
			song.save(() => {
				if (typeof data.user === "undefined") {
					return;
				}
				bot.db.models.person.findOne({
					uid: data.user.id
				}, (err, person) => {
					if (err) {
						bot.log("error", "MONGO", err);
						return;
					}

					if (!person) {
						const doc = {
							uid: data.user.id
						};
						person = new bot.db.models.person(doc);
					}

					person.username = data.user.username;
					person.dubs = data.user.dubs;
					person.save(() => {
						bot.db.models.history.create({
							_song: song._id,
							_person: person._id
						}, err => {
							if (err) {
								bot.log("error", "MONGO", err);
							}
						});
					});
				});
			});
		};

		bot.db.models.songs.aggregate([{
			$match: {
				plays: {
					$gt: 4
				}
			}
		}, {
			$group: {
				_id: null,
				avgPlays: {
					$avg: "$plays"
				}
			}
		}]).exec((err, doc) => {
			if (err) {
				bot.log("error", "MONGO", err);
				return;
			}

			if (doc[0] == null) {
				save(true);
				return;
			}
			
			const nextAllowed = moment(song.lastPlay).add(14, "days");
			if (song.plays > doc[0].avgPlays && !moment(nextAllowed).isBefore()) {
				botLogUser(bot, "info", "ROOM", "%s is playing an OP song", data.user);
				skip("This song appears to be overplayed. Please pick another song.", true);
				save(false);
			}
			save(true);
		});
	});
}
