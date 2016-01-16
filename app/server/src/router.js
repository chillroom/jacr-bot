const Fs = require("fs");
const Path = require("path");

module.exports = function (server) {
	const routes = process.cwd() + "/app/server/src/routes";
	const walk = (dir) => {
		Fs.readdirSync(dir).forEach((file) => {
			const _path = Path.resolve(dir, file);
			Fs.stat(_path, (err, stat) => {
				if (stat && stat.isDirectory()) {
					walk(_path);
				} else {
					if (file.indexOf(".js") > -1) {
						require(_path)(server);
					}
				}
			});
		});
	};
	walk(routes);
};
