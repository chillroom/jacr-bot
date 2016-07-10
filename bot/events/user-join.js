var r;
var bot;

function processJoin(data, results) {
	if (results.length > 1) {
		bot.errLog(results[0].uid + " user multple existence");
		return;
	}

	var user = {
		username: data.user.username
	};

	// If there is no user, create a new user
	if (results.length === 0) {
		user.uid = data.user.id;
		user.platform = "dubtrack";

		r.table("users").insert(user).run().error(bot.errLog);
		return;
	} else if (results[0].username === user.username) {
		// No need to update their username if it is the same username
		return;
	}

	// Otherwise update existing object
	r.table("users").get(results[0].id).update(user).run().error(bot.errLog);
}

function onJoin(data) {
	if (typeof data.user.id === "undefined") {
		return;
	}

	r
		.table('users')
		.getAll("dubtrack", {index: "platform"})
		.filter({uid: data.user.id})
		.pluck("username")
		.run().then(results => processJoin(data, results)).error(bot.errLog);
}

// Performed when nicknames change
function onUpdate(data) {
	if (typeof data.user.id === "undefined") {
		return;
	}

	r
		.table('users')
		.getAll("dubtrack", {index: "platform"})
		.filter({uid: data.user.id})
		.update({username: data.user.username})
		.run().error(bot.errLog);
}

module.exports = receivedBot => {
	bot = receivedBot;
	r = bot.rethink;
	bot.on("user-join", onJoin);
	bot.on("user-update", onUpdate);
};
