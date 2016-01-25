module.exports = function(bot, data) {
    var user = data.user.username;
    var rank = data.user.role;
    //if the user has name in the bot.devs array, or their role is one from bot.rank
    if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
        if (typeof(data.params) !== "undefined" && data.params.length > 0) {
            if (data.params.length === 1) {
                var username = data.params[0];
                if (username.substr(0, 1) === "@") {
                    //remove the @
                    username = username.substr(1);
                }
                try {
                    var person = bot.getUserByName(username);
                    var kickcount = (typeof(person.kickCount) === "undefined") ? 0 : person.kickCount;
                    bot.sendChat(bot.identifier + "Username : " + person.username + "\n" + " Played songs : " + person.playedCount + "\n" + " Songs in queue : " + person.songsInQueue + "\n" + " Dubs : " + person.dubs + "\n" + " Kick count : " + kickcount);
                } catch (e) {
                    bot.sendChat(bot.identifier + "username is invalid.");
                }
            } else {
                bot.sendChat(bot.identifier + "Please enter a single username.");
            }

        }
    }
};