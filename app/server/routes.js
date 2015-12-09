var fs = require("fs"),
	path = require("path");

module.exports = function (server) {
	var routes = process.cwd() + "/app/server/routes";
	var walk = function (dir) {
		fs.readdirSync(dir).forEach(function (file) {
			var _path = path.resolve(dir, file);
			fs.stat(_path, function (err, stat) {
				if (stat && stat.isDirectory()) {
					walk(_path);
				} else {
					/* istanbul ignore else */
					if (file.indexOf(".js") > -1) {
						require(_path)(server);
					}
				}
			});
		});
	};
	walk(routes);
};
