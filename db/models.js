const Fs = require("fs");

module.exports = (bot, mongoose) => {
    const models = process.cwd() + "/db/models";
    Fs.readdirSync(models).forEach((file) => {
        if (file.indexOf(".js") > -1) {
            require(models + "/" + file)(bot, mongoose);
        }
    });
};
