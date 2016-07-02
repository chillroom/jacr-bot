const r = require("rethinkdb");

var bot;

function errLog(err) {
	if (err != null) {
		bot.log("error", "RETHINK", err);
		return true;
	}
	return false;
}

function processJoin(data, results) {
	if (results.length > 1) {
		errLog(results[0].uid + " user multple existence");
		return;
	}

	var user = {
		username: data.user.username
	};

	// If there is no user, create a new user
	if (results.length === 0) {
		user.uid = data.user.id;
		user.site = "dubtrack";

		r.table("users").insert(user).run(bot.rethink, errLog);
		return;
	} else if (results[0].username === user.username) {
		// No need to update their username if it is the same username
		return;
	}

	// Otherwise update existing object
	r.table("users").get(results[0].id).update(user).run(bot.rethink, errLog);
}

function onJoin(data) {
	if (typeof data.user.id === "undefined") {
		return;
	}

	r
		.table('users')
		.getAll("dubtrack", {index: "site"})
		.filter({uid: data.user.id})
		.pluck("username")
		.run(bot.rethink, function(err, cursor) {
			if (errLog(err)) {
				return;
			}

			cursor.toArray().then(results => {
				processJoin(data, results);
			}).error(errLog);
		});
}

// Performed when nicknames change
function onUpdate(data) {
	if (typeof data.user.id === "undefined") {
		return;
	}

	r
		.table('users')
		.getAll("dubtrack", {index: "site"})
		.filter({uid: data.user.id})
		.update({username: data.user.username})
		.run(bot.rethink, errLog);
}

module.exports = receivedBot => {
	bot = receivedBot;
	bot.on("user-join", onJoin);
	bot.on("user-update", onUpdate);
};
