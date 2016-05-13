module.exports = (bot, data) => {
    const DJ = bot.getDJ();
    const user = data.user.username;
    const rank = data.user.role;
    if (bot.vips.indexOf(rank) == -1) {
        bot.log("info", "SKIP", user + " tried to skip a song without the necessary permissions")
        return
    }
    if (data.params == null) {
        return
    }

    if (bot.protection) {
        return
    }

    bot.protection = true;
    setTimeout(() => {
        bot.protection = false;
    }, 5000);
    bot.moderateSkip();
    bot.log("info", "SKIP", user + " skipped the current song.")

    if (data.params.length == 0) {
        bot.sendChat(bot.identifier + "No reason given. If you supply a reason (op, forbidden, unavailable, nsfw, theme), I will be able to autoskip it next time");
        return
    }

    var media = bot.getMedia();
    switch (data.params[0]) {
    case "unpop":
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
    case "unv":
    case "unav":
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
            bot.moderateBanUser(DJ.id, 0);
        }
        break;
    default:
        bot.sendChat(bot.identifier + "Parameter not recognised, but you can suggest it (see !suggest)");
    }
};
