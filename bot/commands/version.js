const pkg = require(process.cwd() + "/package.json");

module.exports = (bot) => {
    bot.sendChat(bot.identifier + "ver: " + pkg.version);
};

module.exports.extra = ["ver", "v"];
