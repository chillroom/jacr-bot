var pkg = require(process.cwd() + "/package.json");

module.exports = function (server) {
	server.get("/", function (req, res, next) {
		res.json({
			code: "online",
			message: "Betabot API Server Online. Don't ask me if the Bot is though D:",
			version: pkg.version
		});
		return next();
	});
};
