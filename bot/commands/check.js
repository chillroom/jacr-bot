const moment = require("moment");
const db = require("../lib/db");

// see https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

function createResponse(bot, data, idSearch) {
	const prefix = idSearch ? "(By ID) " : "";

	return (err, res) => {
		if (bot.checkError(err, "pgpsql", "could not check song")) {
			bot.sendChat(`${data.user.username}: Database search failed`);
			return;
		}

		if (res.rowCount === 0) {
			bot.sendChat("Could not find song");
			return;
		}

		let message = `${prefix}The `;
		if (res.rowCount > 1) {
			message = `Found ${res.rowCount} songs matching that title. The first `;
		}

		const doc = res.rows[0];
		const isOldSong = moment(doc.last_play).add(2, 'months').isBefore();

		message += `song ${doc.name} has been played ${doc.total_plays} time${doc.total_plays === 1 ? "" : "s"} (${isOldSong ? 0 : doc.recent_plays} recently). Last play: ${moment(doc.last_play).fromNow()}.`;
		if (doc.skip_reason != null) {
			message += ` Skip reason: ${doc.skip_reason}`;
		}
		bot.sendChat(message);
	};
}

module.exports = (bot, data) => {
	if (data.params[0] == null) {
		bot.sendChat("Usage: !check <partial song title> OR !check youtube:<id>");
		return;
	}

	if (data.params.length === 1) {
		const text = data.params[0];
		const firstColon = text.indexOf(":");
		if (firstColon !== -1) {
			const type = text.slice(0, firstColon);
			const fkid = text.slice(firstColon + 1);

			if (type === "youtube" || type === "soundcloud") {
				const response = createResponse(bot, data, true);
				db.query("SELECT * FROM songs WHERE type = $1 and fkid = $2", [type, fkid], response);
				return;
			}
		}
	}

	const text = data.params.join(" ").toLowerCase().replace(matchOperatorsRe, '\\$&');
	const r = bot.rethink;
	const response = createResponse(bot, data, false);

	db.query(
		"SELECT similarity(songs.name, $1) as sim, * FROM songs WHERE (songs.name % $1) ORDER BY sim DESC LIMIT 2",
		[text],
		response
	);
};
