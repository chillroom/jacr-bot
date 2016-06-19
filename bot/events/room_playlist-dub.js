module.exports = (bot) => {
    bot.on("room_playlist-dub", (data) => {
        if (typeof(data.id) !== "undefined") {
            bot.db.models.person.findOne({
                uid: data.user.id
            }, (err, person) => {
                if (err) {
                    bot.log("error", "BOT", err);
                } else {
                    if (!person) {
                        person = new bot.db.models.person({
                            uid: data.user.id
                        });
                    }
                    person.username = data.user.username;
                    person.dubs = data.user.dubs;
                    person.save();
                }
            });
        }
    });
};
