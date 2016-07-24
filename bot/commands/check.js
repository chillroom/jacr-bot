const moment = require("moment");

// see https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

function createResponse(bot, data, idSearch) {
	const prefix = idSearch ? "(By ID) " : "";

	return [
		results => {
			if (results.length === 0) {
				bot.sendChat("Could not find song");
				return;
			}

			let message = `${prefix}The `;
			if (results.length > 1) {
				message = `Found ${results.length} songs matching that title. The first `;
			}

			const doc = results[0];
			const isOldSong = moment(doc.lastPlay).add(2, 'months').isBefore();

			message += `song ${doc.name} has been played ${doc.totalPlays} time${doc.totalPlays === 1 ? "" : "s"} (${isOldSong ? 0 : doc.recentPlays} recently). Last play: ${moment(doc.lastPlay).fromNow()}.`;
			bot.sendChat(message);
		},
		err => {
			bot.errLog(err);
			bot.sendChat(`${data.user.username}: Database search failed`);
		},
	];
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

			const response = createResponse(bot, data, true);
			bot.rethink.
				table("songs").
				getAll(fkid, { index: "fkid" }).
				filter({ type }).
				run().
				then(response[0]).
				error(response[1]);
			return;
		}
	}

	const text = data.params.join(" ").toLowerCase().replace(matchOperatorsRe, '\\$&');
	const r = bot.rethink;
	const response = createResponse(bot, data, false);
	r.
		table("songs").
		filter(
			r.row("name").downcase().
			match(`(.*)${text}(.*)`)
		).
		run().
		then(response[0]).
		error(response[1]);
};
