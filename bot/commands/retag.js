module.exports = (bot, data) => {
	if (bot.vips.indexOf(data.user.role) === -1) {
		bot.sendChat("Access denied.");
		return;
	}

	if (data.params.length === 0) {
		bot.sendChat("Usage: !retag <new song title here>");
		return;
	}

	const media = bot.getMedia();
	if (media == null) {
		bot.sendChat("Please try again. (cannot get song id)");
		return;
	}

	bot.rethink.
		table("songs").
		getAll(media.fkid, { index: "fkid" }).
		filter({ type: media.type }).
		update({
			name: data.params.join(" "),
			retagged: true,
			autoretagged: false,
		}).
		run().
		then(() => {
			bot.moderateDeleteChat(data.id);
			return;
		}).
		error((err) => {
			bot.errLog(err);
			bot.sendChat("Internal error retagging song");
		});
};
