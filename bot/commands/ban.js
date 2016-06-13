module.exports = (bot, data) => {
    const user = data.user.username;
    const rank = data.user.role;
    if (bot.ranks.indexOf(rank) === -1) {
        return
    }

    if (typeof(data.params) !== "undefined" && data.params.length > 0) {
    } else {
        return
    }

    var username = data.params[0];
    if (username.substr(0, 1) === "@") {
        //remove the @
        username = username.substr(1);
    }

    var time = 60;

    var person = bot.getUserByName(username);
    if (bot.isVIP(person)) {
        bot.moderateUnsetRole(person.id, person.role);
    }

    if (data.params.length > 1) {
        const secondParam = data.params[1];
        if (!isNaN(parseInt(secondParam))) {
            time = parseInt(secondParam);
        }   
    }
    bot.moderateBanUser(person.id, time);                 
};
