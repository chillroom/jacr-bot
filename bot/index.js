const DubAPI = require("dubapi");
const log = require("jethro");
const pkg = require(process.cwd() + "/package.json");
const config = require(process.cwd() + "/config");
const Raffle = require("./raffle.js")

log.setUTC(true);

new DubAPI({
    username: config.bot.name,
    password: config.bot.pass
}, (err, bot) => {
    if (err) {
        return log("error", "BOT", err);
    }

    //setup logger
    bot.log = require("jethro");
    bot.log.setUTC(true);

    bot.log("info", "BOT", "DubAPI Version: " + bot.version);
    bot.on("connected", (name) => {
        // bot.sendChat(bot.identifier + "online! ver: " + pkg.version);
        bot.log("info", "BOT", "Bot Version: " + pkg.version);
        bot.log("info", "BOT", "Bot connected to: " + name);
        bot.log("info", "BOT", "Bot ID: " + bot._.self.id);
        Raffle.updateState(bot)
        var users = bot.getUsers();
        users.forEach((user) => {
            if (typeof(user.id) !== "undefined") {
                bot.db.models.person.findOne({
                    uid: user.id
                }, (err, person) => {
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
    bot.on("disconnected", (name) => {
        bot.log("warning", "BOT", "Disconnected from " + name);
        setTimeout(connect, 15000);
    });
    bot.on("error", function(err) {
        bot.log("error", "BOT", err);
    });


    //setup db
    bot.db = require(process.cwd() + "/db");
    
    // connect
    bot.connect(config.bot.URL);

    //setup > mod ranks
    bot.ranks = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001"];
    //setup > vip ranks
    bot.vips = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001", "5615fe1ee596154fc2000001"];
    //setup devs
    bot.devs = [];
    //setup bot.identifier
    bot.identifier = "";
    //setup protection for double skips
    bot.protection = false;
    //stop bot from inputting song/history twice
    bot.started = false;

    require("./events")(bot);
    require("./utils")(bot);
    module.exports = bot;
});
