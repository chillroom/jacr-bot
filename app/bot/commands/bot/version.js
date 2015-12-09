var pkg = require(process.cwd() + "/package.json");

module.exports = function (bot) {
	bot.sendChat(bot.identifier + "ver: " + pkg.version);
};
