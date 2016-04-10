module.exports = (bot, data) => {
    const user = data.user.username;
    const rank = data.user.role;
    //if the user has name in the bot.devs array, or their role is one from bot.rank
    if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
        bot.db.models.settings.findOne({
            id: "s3tt1ng5"
        }, (err, doc) => {
            if (err) {
                bot.log("error", "MONGO", err);
            } else {
                if (doc.raffle.enabled) {
                    doc.raffle.enabled = false;
                    bot.sendChat(bot.identifier + "raffle disabled");
                } else {
                    doc.raffle.enabled = true;
                    bot.sendChat(bot.identifier + "raffle enabled");
                }
                doc.save((err) => {
                    if (err) {
                        bot.log("error", "MONGO", err);
                    }
                });
            }
        });
    }
};
