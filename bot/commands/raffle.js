// jshint esversion: 6
// jshint strict: true
// jshint node: true
// jshint asi: true
"use strict";
var Raffle = require("../raffle.js")

module.exports = (bot, data) => {
    const user = data.user.username;
    const rank = data.user.role;
    //if the user has name in the bot.devs array, or their role is one from bot.rank
    if (bot.ranks.indexOf(rank) == -1) {
        return
    }

    if (data.params.length === 0) {
        bot.sendChat("@"+data.user.username+": !raffle (enable|disable|start|stop)")
        return
    }

    bot.db.models.settings.findOne({
        id: "s3tt1ng5"
    }, (err, doc) => {
        if (err) {
            bot.log("error", "MONGO", err);
            return 
        }
        
        var onSave;
        switch (data.params[0]) {
        case "enable": 
            onSave = Raffle.enable(bot, doc)
            bot.sendChat("/me enabled the raffle");
            break;
        case "disable":
            onSave = Raffle.disable(bot, doc)
            bot.sendChat("/me disabled the raffle");
            break;
        case "start":
            onSave = Raffle.start(bot, doc);
            bot.sendChat(Raffle.raffleStartingMessage);
            break;
        case "stop":
            onSave = Raffle.stop(bot,doc);
            bot.sendChat("/me stopped the current raffle");
            break;
        }

        doc.save((err) => {
            if (err) {
                bot.log("error", "MONGO", err);
            }

            if (onSave != null) {
                onSave(bot, doc)
            }
        });
    });
};
