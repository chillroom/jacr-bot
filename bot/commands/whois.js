const db = require("../lib/db");

module.exports = (bot, data) => {
	let username = data.user.username;
	if (data.params[0] != null) {
		username = data.params[0];
		if (username.substr(0, 1) === "@") {
			username = username.substr(1);
		}
	}

	bot.util.getUserIDFromName(username, (nameErr, dubid) => {
		if (nameErr != null) {
			bot.sendChat("Could not find user.");
			return;
		}

		db.query("SELECT * FROM dubtrack_users WHERE dub_id = $1", [dubid],
			(err, res) => {
				if (bot.checkError(err, "pgsql", 'could not update karma++')) {
					bot.sendChat("Could not update karma++.");
					return;
				} else if (res.rowCount === 0) {
					bot.sendChat(`@${data.user.username}, I don't know who ${username} is!`);
					return;
				}

				const row = res.rows[0];
				bot.sendChat(`${username} | JACR: karma(${row.karma}), id(${row.id}) | Dubtrack: id(${row.dub_id})`);
			}
		);
	});
};
