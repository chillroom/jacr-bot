module.exports = function(bot, data) {
    var text = data.params.join(" ");
    text = text.replace(/-+/g, "").replace(/\s+/g, " ").trim();
    bot.db.models.song.find({
        $text: {
            $search: text
        }
    }, {
        score: {
            $meta: "textScore"
        }
    }).sort({
        score: {
            $meta: "textScore"
        }
    }).limit(1).exec(function(err, doc) {
        if (err) {
            bot.sendChat(bot.identifier + "leaf me alone, I has an error");
            bot.log("error", "MONGO", err);
        } else {
            if (doc[0]) {
                bot.sendChat(bot.identifier + doc[0].name + " has been played " + doc[0].plays + " times before");
            } else {
                bot.sendChat(bot.identifier + "way to go sailor, that song hasn't been played before");
            }
        }
    });
};
