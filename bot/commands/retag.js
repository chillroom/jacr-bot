const db = require("../lib/db");

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
		bot.sendChat("No song is currently playing. (cannot get song id)");
		return;
	}

	const name = data.params.join(" ");

	db.query("UPDATE songs SET retagged = true, autoretagged = false, name = $3 where (fkid = $1) and (type = $2)", [media.fkid, media.type, name], (err, res) => {
		if (bot.checkError(err, "pgsql", 'could not retag') || res.rowCount === 0) {
			bot.sendChat("Could not retag, internal error! Tell @qaisjp.");
			return;
		}

		bot.moderateDeleteChat(data.id);
	});
};
