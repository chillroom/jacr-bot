var fs = require("fs");

module.exports = function (server, mongoose) {
	var models = process.cwd() + "/app/server/models";
	fs.readdirSync(models).forEach(function (file) {
		if (file.indexOf(".js") > -1) {
			require(models + "/" + file)(server, mongoose);
		}
	});
};
