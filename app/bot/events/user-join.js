module.exports = function (bot) {
	bot.on("user-join", function (data) {
		if (typeof (data.id) !== "undefined") {
			bot.db.models.person.findOne({
				uid: data.user.id
			}, function (err, person) {
				if (err) {
					bot.log("error", "BOT", err);
				} else {
					if (!person) {
						person = new bot.db.models.person({
							uid: data.user.id
						});
					}
					var moderator = {
						isMod: false
					};
					if (bot.isMod(data.user)) {
						moderator["type"] = "mod";
						moderator["isMod"] = true;
					} else if (bot.isManager(data.user)) {
						moderator["type"] = "manager";
						moderator["isMod"] = true;
					} else if (bot.isOwner(data.user)) {
						moderator["type"] = "co-owner";
						moderator["isMod"] = true;
					}
					if (moderator.isMod) {
						person.rank.name = moderator.type;
						person.rank.rid = data.user.role;
					}
					person.username = data.user.username;
					person.dubs = data.user.dubs;
					person.save();
				}
			});
		}
	});
};
