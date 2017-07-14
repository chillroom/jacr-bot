module.exports = (bot, data) => {
	// remove the @
	let username = data.params[0];
	if (username.substr(0, 1) === "@") {
		username = username.substr(1);
	}

	bot.sendChat(`@everyone Please give a big JACR welcome our next DJ in today's line up @${username}!`);
};
