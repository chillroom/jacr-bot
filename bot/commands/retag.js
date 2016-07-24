module.exports = (bot, data) => {
	if (bot.vips.indexOf(data.user.role) === -1) {
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
		update({ name: data.params.join(" ") }).
		run().
		then(() => {
			bot.sendChat("Song successfully retagged");
			return;
		}).
		error((err) => {
			bot.errLog(err);
			bot.sendChat("Internal error retagging song");
		});
};
