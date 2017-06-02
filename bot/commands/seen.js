const moment = require("moment");
const db = require("../lib/db.js");

function buildDescription(u) {
	if (u.seen_type === "message") {
		return `saying "${u.seen_message}"`;
	}

	if (u.seen_type === "join") {
		return `joining the room`;
	}

	return "doing something..";
}

module.exports = (bot, data) => {
	if (data.params == null) {
		bot.sendChat(`@${data.user.username} - See when someone last did something - Usage: !seen @user`);
		return;
	}
	
	const targetName = (data.params[0].charAt(0) === "@") ? data.params[0].slice(1) : data.params[0];
	
	bot.util.getUserIDFromName(targetName, (nameErr, id) => {
		if (nameErr != null) {
			bot.sendChat("User does not exist on Dubtrack!");
			return;
		}
		
		db.query("SELECT * FROM dubtrack_users WHERE dub_id = $1", [id], (err, res) => {
			if (bot.checkError(err, "pgsql", "seen")) {
				bot.sendChat("Internal error.");
				return;
			}

			if (res.rows.length === 0) {
				bot.sendChat(`@${data.user.username}, I don't know who '${targetName}' is!`);
				return;
			}

			const u = res.rows[0];
			bot.sendChat(`@${data.user.username} - ${moment(u.seen_time).fromNow()}, '${targetName}' was last seen ${buildDescription(u)}.`);

			return;
		});
	});
};
