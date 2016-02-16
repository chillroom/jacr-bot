var DubAPI = require("dubapi"),
    log = require("jethro"),
    pkg = require(process.cwd() + "/package.json"),
    config = require(process.cwd() + "/config");

log.setUTC(true);

new DubAPI({
    username: config.botName,
    password: config.botPass
}, function(err, bot) {
    if (err) {
        return log("error", "BOT", err);
    }
    //setup logger
    bot.log = require("jethro");
    bot.log.setUTC(true);

    function connect() {
        bot.connect(config.roomURL);
    }
    bot.log("info", "BOT", "DubAPI Version: " + bot.version);
    bot.on("connected", function(name) {
        bot.sendChat(bot.identifier + "online! ver: " + pkg.version);
        bot.log("info", "BOT", "Bot Version: " + pkg.version);
        bot.log("info", "BOT", "Bot connected to: " + name);
        bot.log("info", "BOT", "Bot ID: " + bot._.self.id);
        var users = bot.getUsers();
        users.forEach(function(user) {
            if (typeof(user.id) !== "undefined") {
                bot.db.models.person.findOne({
                    uid: user.id
                }, function(err, person) {
                    if (err) {
                        bot.log("error", "BOT", err);
                    } else {
                        if (!person) {
                            var doc = {
                                username: user.username,
                                uid: user.id,
                                dubs: user.dubs
                            };
                            person = new bot.db.models.person(doc);
                        }
                        var moderator = {
                            isMod: false
                        };
                        if (bot.isMod(user)) {
                            moderator["type"] = "mod";
                            moderator["isMod"] = true;
                        } else if (bot.isManager(user)) {
                            moderator["type"] = "manager";
                            moderator["isMod"] = true;
                        } else if (bot.isOwner(user)) {
                            moderator["type"] = "co-owner";
                            moderator["isMod"] = true;
                        }
                        if (moderator.isMod) {
                            person.rank.name = moderator.type;
                            person.rank.rid = user.role;
                            person.save();
                        }
                    }
                });
            }
        });
    });
    bot.on("disconnected", function(name) {
        bot.log("warning", "BOT", "Disconnected from " + name);
        setTimeout(connect, 15000);
    });
    bot.on("error", function(err) {
        bot.log("error", "BOT", err);
    });
    connect();
    //setup db
    bot.db = require(process.cwd() + "/app/common/index.js");

    //setup > mod ranks
    bot.ranks = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001"];
    //setup > vip ranks
    bot.vips = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001", "5615fe1ee596154fc2000001"];
    //setup devs
    bot.devs = ["tigerpancake", "mclovinthesex", "nitroghost"];
    //setup bot.identifier
    bot.identifier = ":white_small_square: ";
    //setup protection for double skips
    bot.protection = false;
    //stop bot from inputting song/history twice
    bot.started = false;
    //setup emojis
    bot.emojis = require("./emojis");
    require("./events")(bot);
    require("./utils")(bot);
    module.exports = bot;
});
