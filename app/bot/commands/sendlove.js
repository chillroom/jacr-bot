module.exports = function (bot, data) {
	var user = data.user.username;
	if (typeof (data.params) !== "undefined" && data.params.length > 0) {
		if (data.params.length === 1) {
			if (data.params[0].substr(0, 1) === "@") {
				var recipient = data.params[0];
				bot.sendChat("@" + user + " just sent " + recipient + " love... What a worthless gift!");
			} else {
				bot.sendChat("@" + user + " you need to @[username] to send them love");
			}
		} else {
			bot.sendChat("@" + user + " you can only send a love to one person at a time you whore you");
		}
	} else {
		bot.sendChat("@" + user + " just sent me love. aww what a cutie");
	}
};
