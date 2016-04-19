module.exports = (bot, data) => {
    const DJ = bot.getDJ();
    const user = data.user.username;
    const rank = data.user.role;
    if (bot.devs.indexOf(user) > -1 || bot.vips.indexOf(rank) > -1) {
        if (typeof(data.params) !== "undefined") {
            var reset = () => {
                setTimeout(() => {
                    bot.protection = false;
                }, 5000);
            };
            if (data.params.length > 0) {
                if (!bot.protection) {
                    bot.protection = true;
                    var media = bot.getMedia();
                    bot.moderateSkip(reset);
                    switch (data.params[0]) {
                    case "unpop":
                        bot.sendChat(bot.identifier + "Awww shucks, your song has been voted by the community as unpopular. Please check theme for guidance on what to play. http://just-a-chill-room.net/rules/#theme");
                        break;
                    case "shit":
                        bot.sendChat(bot.identifier + "Awww shucks, your song has been voted by the community as unpopular. Please check theme for guidance on what to play. http://just-a-chill-room.net/rules/#theme");
                        break;
                    case "op":
                        bot.db.models.songs.findOne({
                            fkid: media.fkid
                        }, (err, doc) => {
                            if (err) {
                                bot.log("error", "BOT", err);
                            } else {
                                if (doc) {
                                    doc.op = true;
                                    doc.save();
                                }
                            }
                        });
                        bot.sendChat(bot.identifier + "Song skipped for being op, check http://just-a-chill-room.net/op-forbidden-list/ next time please");
                        setTimeout(() => {
                            bot.moderateMoveDJ(DJ.id, 1);
                        }, 5000);
                        break;
                    case "history":
                        bot.sendChat(bot.identifier + "Song was recently played, history can be viewed by clicking queue then room history.");
                        setTimeout(() => {
                            bot.moderateMoveDJ(DJ.id, 1);
                        }, 5000);
                        break;
                    case "hist":
                        bot.sendChat(bot.identifier + "Song was recently played, history can be viewed by clicking queue then room history.");
                        setTimeout(() => {
                            bot.moderateMoveDJ(DJ.id, 1);
                        }, 5000);
                        break;
                    case "nsfw":
                        bot.db.models.songs.findOne({
                            fkid: media.fkid
                        }, (err, doc) => {
                            if (err) {
                                bot.log("error", "BOT", err);
                            } else {
                                if (doc) {
                                    doc.nsfw = true;
                                    doc.save();
                                }
                            }
                        });
                        bot.sendChat(bot.identifier + "Song skipped for being NSFW, too much NSFW = ban!");
                        break;
                    case "theme":
                        bot.db.models.songs.findOne({
                            fkid: media.fkid
                        }, (err, doc) => {
                            if (err) {
                                bot.log("error", "BOT", err);
                            } else {
                                if (doc) {
                                    doc.theme = false;
                                    doc.save();
                                }
                            }
                        });
                        bot.sendChat(bot.identifier + "Song does not fit the room theme.");
                        break;
                    case "forbidden":
                        bot.db.models.songs.findOne({
                            fkid: media.fkid
                        }, (err, doc) => {
                            if (err) {
                                bot.log("error", "BOT", err);
                            } else {
                                if (doc) {
                                    doc.forbidden = true;
                                    doc.save();
                                }
                            }
                        });
                        bot.sendChat(bot.identifier + "This song is on the forbidden list: http://just-a-chill-room.net/op-forbidden-list/");
                        break;
                    case "na":
                        bot.db.models.songs.findOne({
                            fkid: media.fkid
                        }, (err, doc) => {
                            if (err) {
                                bot.log("error", "BOT", err);
                            } else {
                                if (doc) {
                                    doc.unavailable = true;
                                    doc.save();
                                }
                            }
                        });
                        bot.sendChat(bot.identifier + "This song is not available to all users");
                        setTimeout(() => {
                            bot.moderateMoveDJ(DJ.id, 1);
                        }, 5000);
                        break;
                    case "unav":
                        bot.db.models.songs.findOne({
                            fkid: media.fkid
                        }, (err, doc) => {
                            if (err) {
                                bot.log("error", "BOT", err);
                            } else {
                                if (doc) {
                                    doc.unavailable = true;
                                    doc.save();
                                }
                            }
                        });
                        bot.sendChat(bot.identifier + "This song is not available to all users");
                        setTimeout(() => {
                            bot.moderateMoveDJ(DJ.id, 1);
                        }, 5000);
                        break;
                    case "unavailable":
                        bot.db.models.songs.findOne({
                            fkid: media.fkid
                        }, (err, doc) => {
                            if (err) {
                                bot.log("error", "BOT", err);
                            } else {
                                if (doc) {
                                    doc.unavailable = true;
                                    doc.save();
                                }
                            }
                        });
                        bot.sendChat(bot.identifier + "This song is not available to all users");
                        setTimeout(() => {
                            bot.moderateMoveDJ(DJ.id, 1);
                        }, 5000);
                        break;
                    case "troll":
                        if (bot.ranks.indexOf(DJ.role) === -1) {
                            bot.db.models.person.findOne({
                                username: user
                            }, (err, banner) => {
                                if (err) {
                                    bot.log("error", "BOT", err);
                                } else {
                                    banner.rank.banCount++;
                                    banner.save(() => {
                                        bot.db.models.person.findOne({
                                            uid: DJ.id
                                        }, (err, ban) => {
                                            if (err) {
                                                bot.log("error", "BOT", err);
                                            } else {
                                                if (!ban) {
                                                    const doc = {
                                                        username: DJ.username,
                                                        uid: DJ.id,
                                                        "ban.count": 0
                                                    };
                                                    ban = new bot.db.models.person(doc);
                                                }
                                                ban.ban.lastBan = new Date();
                                                ban.ban.count++;
                                                ban.ban.by = banner.username;
                                                ban.save(() => {
                                                    bot.db.models.bans.create({
                                                        _person: ban._id
                                                    });
                                                });
                                                bot.moderateBanUser(DJ.id, 0);
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        break;
                    default:
                        bot.sendChat(bot.identifier + "Parameter not recognised, but you can suggest it here: https://bitbucket.org/dubbot/illumibot/");
                    }
                }
            } else {
                if (!bot.protection) {
                    bot.protection = true;
                    bot.moderateSkip(reset);
                    bot.sendChat(bot.identifier + "No reason given. If you supply a reason (op, forbidden, unavailable, nsfw, theme), I will be able to autoskip it next time");
                }
            }
        }
    }
};
