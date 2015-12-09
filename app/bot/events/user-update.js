module.exports = function (bot) {
	bot.on("user-update", function (data) {
		if (typeof (data) !== "undefined") {
			bot.db.models.person.findOne({
				uid: data.id
			}, function (err, doc) {
				if (err) {
					bot.log("error", "BOT", err);
				} else {
					if (doc) {
						doc.username = data.username;
						doc.dubs = data.dubs;
						doc.save();
					} else {
						doc = {
							username: data.username,
							uid: data.id,
							dubs: data.dubs
						};
						bot.db.models.person.create(doc, function (err) {
							if (err) {
								bot.log("error", "BOT", err);
							}
						});
					}
				}
			});
		}
	});
};
