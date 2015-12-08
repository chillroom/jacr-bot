var fs = require("fs");

module.exports = function (bot, mongoose) {
	var schemas = process.cwd() + "/app/bot/schemas";
	fs.readdirSync(schemas).forEach(function (file) {
		if (file.indexOf(".js") > -1) {
			require(schemas + "/" + file)(bot, mongoose);
		}
	});
};
