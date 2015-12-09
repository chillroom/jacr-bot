module.exports = function (bot, data) {
	var user = data.user.username;
	var rank = data.user.role;
	if (bot.devs.indexOf(user) > -1 || bot.vips.indexOf(rank) > -1) {
		if (typeof (data.params) !== "undefined") {
			var reset = function () {
				setTimeout(function () {
					bot.protection = false;
				}, 2000);
			};
			if (data.params.length > 0) {
				if (!bot.protection) {
					bot.protection = true;
					var media = bot.getMedia();
					bot.moderateSkip(reset);
					switch (data.params[0]) {
					case "op":
						bot.db.models.song.findOne({
								fkid: media.fkid
							}, function(err, doc) {
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
						break;
					case "history":
						bot.sendChat(bot.identifier + "Song was recently played, history can be viewed by clicking queue then room history.");
						break;
					case "hist":
						bot.sendChat(bot.identifier + "Song was recently played, history can be viewed by clicking queue then room history.");
						break;
					case "nsfw":
						bot.db.models.song.findOne({
								fkid: media.fkid
							}, function(err, doc) {
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
						bot.db.models.song.findOne({
								fkid: media.fkid
							}, function(err, doc) {
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
						bot.db.models.song.findOne({
								fkid: media.fkid
							}, function(err, doc) {
								if (err) {
									bot.log("error", "BOT", err);
								} else {
									if (doc) {
										doc.forbidden = true;
										doc.save();
									}
								}
							});
						bot.sendChat(bot.identifier + "This song is on the forbidden list: http://just-a-chill-room.net/op-forbidden-list/ ");
						break;
					case "na":
						bot.sendChat(bot.identifier + "This song is not available to all users");
						break;
					case "unv":
						bot.db.models.song.findOne({
								fkid: media.fkid
							}, function(err, doc) {
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
						break;
					case "unvailable":
						bot.db.models.song.findOne({
								fkid: media.fkid
							}, function(err, doc) {
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
						break;
					default:
						bot.sendChat(bot.identifier + "Parameter not recognised, but you can suggest it here: https://bitbucket.org/dubbot/dubbot/issues?status=new&status=open");
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
