module.exports = (bot) => {
    bot.on("user-update", (data) => {
        if (typeof(data.id) !== "undefined") {
            bot.db.models.people.findOne({
                uid: data.user.id
            }, (err, person) => {
                if (err) {
                    bot.log("error", "BOT", err);
                } else {
                    if (!person) {
                        person = new bot.db.models.people({
                            uid: data.user.id
                        });
                    }
                    var moderator = {
                        isMod: false
                    };
                    if (bot.isMod(data.user)) {
                        moderator["type"] = "mod";
                        moderator["isMod"] = true;
                    } else if (bot.isManager(data.user)) {
                        moderator["type"] = "manager";
                        moderator["isMod"] = true;
                    } else if (bot.isOwner(data.user)) {
                        moderator["type"] = "co-owner";
                        moderator["isMod"] = true;
                    }
                    if (moderator.isMod) {
                        person.rank.name = moderator.type;
                        person.rank.rid = data.user.role;
                    }
                    person.username = data.user.username;
                    person.dubs = data.user.dubs;
                    person.save();
                }
            });
        }
    });
};
