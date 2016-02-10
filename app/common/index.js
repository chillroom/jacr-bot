var mongoose = require("mongoose"),
    log = require("jethro"),
    config = require(process.cwd() + "/config");

log.setUTC(true);
log.setTimeformat("YYYY-MM-DD HH:mm:ss:SSS");

//setup db
mongoose.connect(config.mongoURL, {
    server: {
        auto_reconnect: true
    }
});

db = mongoose.connection;

db.on("error", function(err) {
    log("error", "MONGO", "Connection error:" + err);
});
db.on("connected", function() {
    log("info", "MONGO", "Connected!");
});
db.on("disconnected", function() {
    log("warning", "MONGO", "Disconnected!");
    mongoose.connect(config.mongoURL, {
        server: {
            auto_reconnect: true
        }
    });
});
db.on("reconnected", function() {
    log("info", "MONGO", "Reconnected!");
});

require("./models")(db, mongoose);

module.exports = db;
