module.exports = function (bot) {
	var user = data.user.username;
	var rank = data.user.role;
	//if the user has name in the bot.devs array, or their role is one from bot.rank
	if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
		bot.db.models.ban.find().sort({
			time: -1
		}).limit(1).populate("_person").exec(function (err, doc) {
			if (err) {
				bot.log("error", "BOT", err);
			} else {
				if (doc) {
					bot.sendChat(bot.identifier + "username: " + doc._person.username + ", id: " + doc._person.uid + ", banned by: " + doc._person.ban.by + ", ban count:" + doc._person.ban.banCount);
				} else {
					bot.sendChat(bot.identifier + "no ban history");
				}
			}
		});
	}
};
