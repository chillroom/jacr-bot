var fs = require("fs");

module.exports = function(bot, mongoose) {
    var models = process.cwd() + "/app/common/db/models";
    fs.readdirSync(models).forEach(function(file) {
        if (file.indexOf(".js") > -1) {
            require(models + "/" + file)(bot, mongoose);
        }
    });
};
