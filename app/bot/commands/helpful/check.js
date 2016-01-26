var moment = require("moment");

module.exports = function(bot, data) {
    var text = data.params.join(" ");
    text = text.replace(/-+/g, "").replace(/\s+/g, " ").trim();
    if (typeof(data.params) !== "undefined" && data.params.length > 0) {
        bot.db.models.song.aggregate([
            {
                $match: {
                    $text: {
                        $search: text
                    }
                }
            }, {
                $sort: {
                    score: {
                        $meta: "textScore"
                    }
                }
            }, {
                $project: {
                    score: {
                        $meta: "textScore"
                    },
                    name: 1,
                    plays: 1,
                    lastPlay: 1
                }
            }, {
                $match: {
                    score: {
                        $gt: 0.8
                    }
                }
            }, {
                $limit: 1
            }
        ]).exec(function(err, doc) {
            if (err) {
                bot.sendChat(bot.identifier + "leaf me alone, I has an error");
                bot.log("error", "MONGO", err);
            } else {
                if (doc[0]) {
                    doc = doc[0];
                    bot.db.models.history.find({
                        _song: doc._id
                    }).sort({time: -1}).limit(1).populate("_person").exec(function(err, person) {
                        if (err) {
                            bot.sendChat(bot.identifier + "leaf me alone, I has an error");
                            bot.log("error", "MONGO", err);
                        } else {
                            person = person[0]._person;
                            var date = new Date(doc.lastPlay);
                            bot.sendChat(bot.identifier + doc.name + " has been played " + doc.plays + " times before. Last played by " + person.username + " " + moment(date).fromNow() + ".");
                        }
                    });
                } else {
                    bot.sendChat(bot.identifier + "way to go sailor, that song hasn't been played before");
                }
            }
        });
    } else {
        bot.sendChat(bot.identifier + "aw shucks, you didn't include a search query");
    }
};
