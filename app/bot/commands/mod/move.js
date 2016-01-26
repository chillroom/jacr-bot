module.exports = function(bot, data) {
    var user = data.user.username;
    var rank = data.user.role;
    if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
        if (typeof(data.params) !== "undefined" && data.params.length > 0) {
            var username = data.params[0],
                pos = 3;
            if (data.params.length > 1) {
                var position = data.params[1];
                if (username.substr(0, 1) === "@") {
                    //remove the @
                    username = username.substr(1);
                }
                if (!isNaN(parseInt(position))) {
                    pos = parseInt(position);
                }
                var person = bot.getUserByName(username);
                bot.moderateMoveDJ(person.id, pos);
                bot.sendChat(bot.identifier + username + " moved to position: " + pos);
            } else {
                if (username.substr(0, 1) === "@") {
                    //remove the @
                    username = username.substr(1);
                }
                bot.moderateMoveDJ(person.id, pos);
                bot.sendChat(bot.identifier + username + " moved to position: " + pos);
            }
        }
    }
};
