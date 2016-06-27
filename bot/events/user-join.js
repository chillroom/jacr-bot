function onJoin(bot, data) {
	if (typeof data.id === "undefined") {
		return;
	}

	bot.db.models.person.findOne({
		uid: data.user.id
	}, (err, person) => {
		if (err) {
			bot.log("error", "BOT", err);
		} else {
			if (!person) {
				person = new bot.db.models.person({
					uid: data.user.id
				});
			}
			
			person.username = data.user.username;
			person.dubs = data.user.dubs;
			person.save();
		}
	});
}

module.exports = bot => {
	bot.on("user-join", data => onJoin(bot, data));
};
