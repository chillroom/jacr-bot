const mongoose = require("mongoose");
const log = require("jethro");
const config = require(process.cwd() + "/config");

log.setUTC(true);
log.setTimeformat("YYYY-MM-DD HH:mm:ss:SSS");

mongoose.connect(config.mongoURL, {
    server: {
        auto_reconnect: true
    }
});

const db = mongoose.connection;
var callback;

db.on("error", (err) => {
    log("error", "MONGO", "Connection error:" + err);
});
db.on("connected", () => {
    log("info", "MONGO", "Connected!");
    callback(db)
});
db.on("disconnected", () => {
    log("warning", "MONGO", "Disconnected!");
    mongoose.connect(config.mongoURL, {
        server: {
            auto_reconnect: true
        }
    });
});
db.on("reconnected", () => {
    log("info", "MONGO", "Reconnected!");
});

require("./models")(db, mongoose);

module.exports = function(cb) {
    callback = cb
}