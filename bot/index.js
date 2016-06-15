const DubAPI = require("dubapi");
const log = require("jethro");
const pkg = require(process.cwd() + "/package.json");
const config = require(process.cwd() + "/config");
const Raffle = require("./raffle.js")
const Fs = require("fs")

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
        bot.dubtrackReady = true
        onReady(bot)   
    });

    bot.on("disconnected", (name) => {
        bot.log("warning", "BOT", "Disconnected from " + name);
        setTimeout(connect, 15000);
    });
    bot.on("error", function(err) {
        bot.log("error", "BOT", err);
    });


    //setup mongodb
    require(process.cwd() + "/db")( (db) => {
        bot.db = db
        onReady(bot)
    })

    require("./db.js")(bot.log, (conn) => {
        bot.rethink = conn
        onReady(bot)
    })
    
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

    bot.sendMotd = () => {
        bot.db.models.settings.findOne({
            id: "s3tt1ng5"
        }, (err, doc) => {
            
            doc.songCount++;
            doc.save();
            if (doc.motd.enabled) {
                if (doc.songCount % doc.motd.interval === 0) {
                    bot.sendChat(bot.identifier + doc.motd.msg);
                }
            }
        });
    };

    module.exports = bot;
});

var started = false;
function onReady(bot) {
    if (started) { return bot.log("warning", "loader", "Trying to start when already started") }
    if (bot.db == null) { return bot.log("warning", "loader", "Mongo isn't ready") }
    if (bot.rethink == null) { return bot.log("warning", "loader", "RethinkDB isn't ready") }
    if (bot.dubtrackReady == null) { return bot.log("warning", "loader", "Dubtrack isn't ready") }
    bot.log("info", "loader", "We are ready!")
    started = true

    const baseDir = process.cwd() + "/bot/";
    const folders = ["events"]
    for (var i = folders.length - 1; i >= 0; i--) {
        const dir = baseDir + folders[i]
        Fs.readdirSync(dir).forEach((file) => {
            if (file.indexOf(".js") > -1) {
                require(dir + "/" + file)(bot);
            }
        });

    }



    Raffle.updateState(bot)
    
    var users = bot.getUsers();
    users.forEach((user) => {
        if (typeof(user.id) !== "undefined") {
            bot.db.models.person.findOne({
                uid: user.id
            }, (err, person) => {
                if (err) {
                    bot.log("error", "BOT", err);
                    return;
                } 
                if (!person) {
                    var doc = {
                        username: user.username,
                            uid: user.id,
                        dubs: user.dubs
                    };
                    person = new bot.db.models.person(doc);
                }
            });
        }
    });
}