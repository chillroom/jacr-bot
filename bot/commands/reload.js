module.exports = (bot, data) => {
	if (bot.vips.indexOf(data.user.role) === -1) {
		return;
	}

	if (data.params[0] == null) {
		bot.sendChat("Usage: /reload <responses>");
		return;
	}

	switch (data.params[0]) {
	default:
		bot.sendChat("Unknown module.");
		break;
	case "responses":
		require("../events/chat-message.js").LoadResponses();
		break;
	}
};
