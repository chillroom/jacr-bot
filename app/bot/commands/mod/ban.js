module.exports = (bot, data) => {
    const user = data.user.username;
    const rank = data.user.role;
    if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
        if (typeof(data.params) !== "undefined" && data.params.length > 0) {
            var username = data.params[0];
            var time = 60;
            var person;
            if (data.params.length > 1) {
                const secondParam = data.params[1];
                if (username.substr(0, 1) === "@") {
                    //remove the @
                    username = username.substr(1);
                }
                if (!isNaN(parseInt(secondParam))) {
                    time = parseInt(secondParam);
                }
                person = bot.getUserByName(username);
                if (bot.isVIP(person)) {
                    bot.moderateUnsetRole(person.id, person.role);
                }
                setTimeout(() => {
                    if (bot.ranks.indexOf(person.role) === -1) {
                        bot.db.models.people.findOne({
                            username: user
                        }, (err, banner) => {
                            if (err) {
                                bot.log("error", "BOT", err);
                            } else {
                                banner.rank.banCount++;
                                banner.save(() => {
                                    bot.db.models.people.findOne({
                                        uid: person.id
                                    }, (err, ban) => {
                                        if (err) {
                                            bot.log("error", "BOT", err);
                                        } else {
                                            if (!ban) {
                                                var doc = {
                                                    username: username,
                                                    uid: person.id,
                                                    "ban.count": 0
                                                };
                                                ban = new bot.db.models.people(doc);
                                            }
                                            ban.ban.lastBan = new Date();
                                            ban.ban.count++;
                                            ban.ban.by = banner.username;
                                            ban.save(() => {
                                                bot.db.models.bans.create({
                                                    _person: ban._id
                                                });
                                            });
                                            bot.moderateBanUser(person.id, time);
                                        }
                                    });
                                });
                            }
                        });
                    }
                }, 1000);
            } else {
                if (username.substr(0, 1) === "@") {
                    //remove the @
                    username = username.substr(1);
                }
                person = bot.getUserByName(username);
                if (bot.isVIP(person)) {
                    bot.moderateUnsetRole(person.id, person.role);
                }
                setTimeout(() => {
                    if (bot.ranks.indexOf(person.role) === -1) {
                        bot.db.models.people.findOne({
                            username: user
                        }, (err, banner) => {
                            if (err) {
                                bot.log("error", "BOT", err);
                            } else {
                                banner.rank.banCount++;
                                banner.save(() => {
                                    bot.db.models.people.findOne({
                                        uid: person.id
                                    }, (err, ban) => {
                                        if (err) {
                                            bot.log("error", "BOT", err);
                                        } else {
                                            if (!ban) {
                                                const doc = {
                                                    username: username,
                                                    uid: person.id
                                                };
                                                ban = new bot.db.models.people(doc);
                                            }
                                            ban.ban.lastBan = new Date();
                                            ban.ban.count++;
                                            ban.ban.by = banner.username;
                                            ban.save(() => {
                                                bot.db.models.bans.create({
                                                    _person: ban._id
                                                });
                                            });
                                            bot.moderateBanUser(person.id, time);
                                        }
                                    });
                                });
                            }
                        });
                    }
                }, 1000);
            }
        }
    }
};
