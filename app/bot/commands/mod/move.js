module.exports = function(bot, data) {
    var user = data.user.username;
    var rank = data.user.role;
    if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
        if (typeof(data.params) !== "undefined" && data.params.length > 0) {
            var username = data.params[0],
                pos = 1;
            if (data.params.length > 1) {
                var position = data.params[1];
                if (username.substr(0, 1) === "@") {
                    //remove the @
                    username = username.substr(1);
                }
                if (!isNaN(parseInt(position))) {
                    pos = parseInt(position);
                    if (pos <= 0) {
                        pos = 0;
                    } else if (pos >= bot.getQueue().length) {
                        pos = bot.getQueue().length - 1;
                    } else {
                        pos = pos -1;
                    }
                }
                var person = bot.getUserByName(username);
                bot.moderateMoveDJ(person.id, pos);
                var moved = pos + 1;
                bot.sendChat(bot.identifier + username + " moved to position: " + moved);
            } else {
                if (username.substr(0, 1) === "@") {
                    //remove the @
                    username = username.substr(1);
                }
                bot.moderateMoveDJ(person.id, pos);
                bot.sendChat(bot.identifier + username + " moved to position: " + moved);
            }
        }
    }
};
