module.exports = function (bot) {
	var twerks = [
		"http://www.pride.com/sites/pride.com/files/dance.gif"
	];
	var twerk = twerks[Math.floor(Math.random() * twerks.length)];
	bot.sendChat(twerk);
};
