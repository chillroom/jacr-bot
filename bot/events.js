var Fs = require("fs");

module.exports = (bot) => {
    const events = process.cwd() + "/app/bot/events";
    Fs.readdirSync(events).forEach((file) => {
        if (file.indexOf(".js") > -1) {
            require(events + "/" + file)(bot);
        }
    });
};
