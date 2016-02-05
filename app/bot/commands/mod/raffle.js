var raffle = require(process.cwd() + "/bot/utils/raffle");

module.exports = function (bot, db, data) {
    if (!bot.hasPermission(data.user, "set-roles")) {
        return;
    } else {
        if (!raffle.raffleStarted) {
            raffle.startRaffle(bot);
        }
    }
};
