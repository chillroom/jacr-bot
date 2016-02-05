var raffle = require(process.cwd() + "/bot/utilities/raffle");

module.exports = function (bot, db, data) {
    if (!bot.hasPermission(data.user, "set-roles")) {
        return;
    } else {
        if (!raffle.raffleStarted) {
            raffle.startRaffle(bot);
        }
    }
};
