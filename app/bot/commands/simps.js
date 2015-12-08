module.exports = function (bot) {
	var simpses = [
		"http://media0.giphy.com/media/jUwpNzg9IcyrK/giphy.gif",
		"http://asset-2.soupcdn.com/asset/13974/2268_2f97.gif"
	];
	var simps = simpses[Math.floor(Math.random() * simpses.length)];
	bot.sendChat(simps);
};
