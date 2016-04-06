var request = require("request");

module.exports = (bot, data) => {
    const user = data.user.username;
    if (user.toLowerCase() === "mclovinthesex") {
        bot.sendChat(bot.identifier + ":* @" + user);
    }
};
