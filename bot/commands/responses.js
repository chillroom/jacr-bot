const commandUsage = "Usage: /responses (add|del) commandName text...";
const chatEvent = require("../events/chat-message.js");

function addResponse(bot, data, cmdName, message) {
	if (chatEvent.responses[cmdName] != null) {
		bot.sendChat(`@${data.user.username}, response "${cmdName}" already exists.`);
		return;
	}

	const response = [message];
	chatEvent.responses[cmdName] = response;

	bot.rethink.table("responses").insert({
		aliases: [],
		name: cmdName,
		responses: response,
	})
	.run()
	.error(err => {
		bot.errLog(err);
		bot.sendChat(`@${data.user.username}, failed to add response "${cmdName}".`);
	});
}

function removeResponse(bot, data, cmdName) {
	if (chatEvent.responses[cmdName] == null) {
		bot.sendChat(`@${data.user.username}, response "${cmdName}" does not exist.`);
		return;
	}

	delete chatEvent.responses[cmdName];

	bot.rethink.table("responses").getAll(cmdName, { index: "name" }).delete()
	.run()
	.error(err => {
		bot.errLog(err);
		bot.sendChat(`@${data.user.username}, failed to delete response "${cmdName}".`);
	});
}

module.exports = (bot, data) => {
	if (bot.vips.indexOf(data.user.role) === -1) {
		return;
	}

	if (data.params[1] == null) {
		bot.sendChat(commandUsage);
		return;
	}

	if (data.params[0] !== "add" && data.params[0] !== "del") {
		bot.sendChat(commandUsage);
		return;
	}

	const cmdName = data.params[1];
	if (data.params[0] === "del") {
		bot.moderateDeleteChat(data.id);
		removeResponse(bot, data, cmdName);
		return;
	}

	const message = data.params.slice(2).join(" ");
	if (message === "") {
		bot.sendChat(commandUsage);
		return;
	}

	bot.moderateDeleteChat(data.id);
	addResponse(bot, data, cmdName, message);
};
