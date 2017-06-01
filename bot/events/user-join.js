let bot;

function onJoin(data) {
	if (typeof data.user.id === "undefined") {
		return;
	}

	bot.util.updateUser(data.user.id, data.user.username, "join", "");
}

// Performed when nicknames change
function onUpdate(data) {
	if (typeof data.user.id === "undefined") {
		return;
	}

	bot.util.updateUser(data.user.id, data.user.username, "update", "");
}

module.exports = receivedBot => {
	bot = receivedBot;

	bot.on("user-join", onJoin);
	bot.on("user-update", onUpdate);
};
