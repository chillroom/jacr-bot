module.exports = (bot) => {
    bot.sendMotd = () => {
        bot.db.models.settings.findOne({
            id: "s3tt1ng5"
        }, (err, doc) => {
            if (doc) {
                doc.songCount++;
                doc.save();
                if (doc.motd.enabled) {
                    if (doc.songCount % doc.motd.interval === 0) {
                        bot.sendChat(bot.identifier + doc.motd.msg);
                    }
                }
            } else {
                doc = {
                    id: "s3tt1ng5",
                    motd: {
                        msg: "",
                        interval: 15,
                        enabled: false
                    },
                    emoji: {
                        paused: false,
                        reset: false
                    },
                    songCount: 0
                };
                doc.songCount++;
                bot.db.models.settings.create(doc, (err, doc) => {
                    if (err) {
                        bot.log("error", "BOT", err);
                    }
                    if (doc) {
                        return doc;
                    }
                });
            }
            if (err) {
                bot.log("error", "BOT", err);
            }
        });
    };
};
