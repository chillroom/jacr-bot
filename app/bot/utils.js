const Fs = require("fs");

module.exports = (bot) => {
    const utils = process.cwd() + "/app/bot/utils";
    Fs.readdirSync(utils).forEach((file) => {
        if (file.indexOf(".js") > -1) {
            require(utils + "/" + file)(bot);
        }
    });
};
