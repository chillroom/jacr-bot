// jshint esversion: 6
// jshint strict: true
// jshint node: true
// jshint asi: true
"use strict";

var moment = require("moment")

module.exports = (bot) => {
    bot.on("room_playlist-update", (data) => {onUpdate(bot, data)})
};

function onUpdate(bot, data) {
    bot.sendMotd()
    bot.raffle()

    if (!bot.started) {
        bot.started = true
        return
    }

    onUpdateEmoji(bot, data);
    onUpdateLog(bot, data);
}

function onUpdateLog(bot, data) {
    if (typeof(data.media) === "undefined") {
        return;
    }
    else if (typeof(data.user) === "undefined") {
        return
    }

    const user = data.user.id;
    const username = data.user.username
    bot.log("info", "ROOM", username + " ( " + user + " ) is now playing")

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
                bot.log("info", "ROOM", username + " ( " + user + " ) has been skipped")
                if (move) {
                    bot.once("room_playlist-queue-update-dub", () => {
                        bot.moderateMoveDJ(user, 0);
                        bot.log("info", "ROOM", username + " ( " + user + " ) has been moved to the front v3")
                    })
                }
            });
        };
        if (!song) {
            const doc = {
                name: data.media.name,
                fkid: data.media.fkid
            };
            song = new bot.db.models.songs(doc);
        }
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
            const date = new Date() - (1000 * 60 * 60 * 24 * 14);
            const lastPlay = new Date(song.lastPlay);
            const compare = new Date(date);
            if (song.plays > doc[0].avgPlays && moment(lastPlay).isAfter(compare)) {
                bot.log("info", "ROOM", username + " ( " + user + " ) is playing an OP song")
                skip("Song has been recently flagged as overplayed. Please pick another song.", true);
            } else {
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
            }
            song.plays++;
            song.lastPlay = new Date();
            song.save(() => {
                if (typeof(data.user) === "undefined") {
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
                    var moderator = {
                        isMod: false
                    };
                    if (bot.isMod(data.user)) {
                        moderator.type = "mod";
                        moderator.isMod = true;
                    } else if (bot.isManager(data.user)) {
                        moderator.type = "manager";
                        moderator.isMod = true;
                    } else if (bot.isOwner(data.user)) {
                        moderator.type = "co-owner";
                        moderator.isMod = true;
                    }
                    if (moderator.isMod) {
                        person.rank.name = moderator.type;
                        person.rank.rid = data.user.role;
                    }
                    person.username = data.user.username;
                    person.dubs = data.user.dubs;
                    person.save(() => {
                        bot.db.models.history.create({
                            _song: song._id,
                            _person: person._id
                        }, (err) => { if (err) { bot.log("error", "MONGO", err); } } )
                    });
                });
            });
        });
    });
}

function onUpdateEmoji(bot, data) {
    const date = new Date();

    //for the off chance that the bot is started for the first time during a period where it needs to track emojis
    //need to set a time out to make sure the settings in bot.sendMotd() has been created.
    setTimeout(() => {
        //checks to see if it's within the first hour of the day
        if (date.getUTCHours() === 0) {
            bot.db.models.settings.findOne({
                id: "s3tt1ng5"
            }, (err, doc) => {
                if (err) {
                    bot.log("error", "MONGO", err);
                }
                if (!doc.emoji.paused) {
                    var emojis = [];
                    bot.emojis.forEach((emoji, index, arr) => {
                        bot.db.models.emojiCount.findOne({
                            emoji: emoji
                        }, (err, doc) => {
                            if (err) {
                                bot.log("error", "MONGO", err);
                            }
                            if (doc) {
                                const count = {
                                    emojiName: emoji,
                                    count: doc.count
                                };
                                emojis.push(count);
                                doc.count = 0;
                                doc.save();
                            }
                        });
                        if (index === arr.length - 1) {
                            setTimeout(() => {
                                bot.db.models.emojiTrackDays.create({
                                    emojis: emojis
                                }, (err) => {
                                    if (err) {
                                        bot.log("error", "MONGO", err);
                                    }

                                });
                            }, 6000);
                        }
                    });
                    doc.emoji.paused = true;
                    doc.save();
                }
            });

            bot.db.models.chat.find({}).sort({
                time: -1
            }).skip(100).remove().exec((err) => {
                if (err) {
                    bot.log("error", "MONGO", err);
                }
            });
        } else {
            bot.db.models.settings.findOne({
                id: "s3tt1ng5"
            }, (err, doc) => {
                if (err) {
                    bot.log("error", "MONGO", err);
                }
                if (doc.emoji.paused) {
                    doc.emoji.paused = false;
                    doc.save();
                }
            });
        }
    }, 6000);
}
