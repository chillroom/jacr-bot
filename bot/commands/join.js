module.exports = (bot, data) => {
    bot.db.models.settings.findOne({
        id: "s3tt1ng5"
    }, (err, doc) => {
        if (err) {
            bot.log("error", "MONGO", err);
        } else {
            if (!doc.raffle.started) {
                return bot.sendChat(bot.identifier + "There isn't a raffle at this time!");
            }
            if(doc.raffle.users.some((v) => {
                return data.user.id.indexOf(v.id) >= 0;
            })) {
                return bot.sendChat("@" + data.user.username + " you've already entered the raffle!");
            }
            if (!bot.getQueue().some((v) => { return data.user.id.indexOf(v.uid) >= 0; })) {
                return bot.sendChat(bot.identifier + "@" + data.user.username + " you must be in the queue to enter the raffle!");
            }
            else if (bot.getQueuePosition(data.user.id) === 0) {
                return bot.sendChat(bot.identifier + "@" + data.user.username + " you're already at #1!");
            }
            doc.raffle.users.push({"id": data.user.id, "username": data.user.username});
            doc.save((err) => {
                if (err) {
                    bot.log("error", "MONGO", err);
                }
            });
            return bot.sendChat("@" + data.user.username + ", you have entered the raffle!");
        }
    });
};