var raffle = require(process.cwd() + "/app/bot/utils/raffle");

module.exports = function(bot, data) {
    if (!raffle.raffleStarted) {
        return bot.sendChat(bot.identifier + "There isn't a raffle at this time!");
    }
    if (raffle.usersInRaffle.some(function(v) {
        return data.user.id.indexOf(v.id) >= 0;
    }))
    {
        return bot.sendChat(bot.identifier + "@" + data.user.username + " you've already entered the raffle!");
    }
    if (!bot.getQueue().some(function(v) { return data.user.id.indexOf(v.uid) >= 0; })) {
        return bot.sendChat(bot.identifier + "@" + data.user.username + " you must be in the queue to enter the raffle!");
    }
    bot.moderateDeleteChat(data.id, function() {
        if(bot.getQueuePosition(data.user.id) == 0) {
            raffle.lockedNumberOne = data.user.username;
            bot.sendChat(bot.identifier + "@" + data.user.username + " locked in their position at #1!");
        }
        else {
            raffle.usersInRaffle.push({"id": data.user.id, "username": data.user.username});
        }
    });
};
