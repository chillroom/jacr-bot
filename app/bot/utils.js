var fs = require("fs");

module.exports = function(bot) {
    var utils = process.cwd() + "/app/bot/utils";
    fs.readdirSync(utils).forEach(function(file) {
        if (file.indexOf(".js") > -1) {
            require(utils + "/" + file)(bot);
        }
    });
};
