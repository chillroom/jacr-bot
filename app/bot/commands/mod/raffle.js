var raffle = require(process.cwd() + "/app/bot/utils/raffle");

module.exports = function (bot, db, data) {
    var user = data.user.username;
    var rank = data.user.role;
    //if the user has name in the bot.devs array, or their role is one from bot.rank
    if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
        if (!raffle.raffleStarted) {
            raffle.startRaffle(bot);
        }
    }
};
