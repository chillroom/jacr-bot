module.exports = function(bot, data) {
    var user = data.user.username;
    var rank = data.user.role;
    if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
        if (typeof(data.params) !== "undefined" && data.params.length > 0) {
            var username = data.params[0];
            if (username.substr(0, 1) === "@") {
                username = username.substr(1);
            }
            var person = bot.getUserByName(username);
            if (bot.isVIP(person)) {
                bot.moderateUnsetRole(person.id, person.role);
            } else {
                bot.sendChat(bot.identifier + "@" + user + " you can only unset VIPs");
            }
        }
    } else {
        bot.sendChat(bot.identifier + "Please specify a user");
    }
};