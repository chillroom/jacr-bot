module.exports = (bot, data) => {
    const user = data.user.username;
    const rank = data.user.role;
    if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
        if (typeof(data.params) !== "undefined" && data.params.length > 0) {
            if (data.params.length === 1) {
                var username = data.params[0];
                if (username.substr(0, 1) === "@") {
                    username = username.substr(1);
                }
                bot.db.models.chat.find({
                    username: username
                }).sort({
                    time: -1
                }).limit(10).exec((err, docs) => {
                    if (err) {
                        bot.log("error", "BOT", err);
                    } else {
                        docs.forEach((doc) => {
                            bot.moderateDeleteChat(doc.chatid);
                            bot.db.models.chat.remove({
                                chatid: doc.chatid
                            }, (err) => {
                                if (err) {
                                    bot.log("error", "BOT", err);
                                }
                            });
                        });
                    }
                });
            }
        }
    }
};
