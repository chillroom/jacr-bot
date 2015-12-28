var restify = require("restify"),
	mongoose = require("mongoose"),
	config = require(process.cwd() + "/config"),
	pkg = require(process.cwd() + "/package.json");

var server = restify.createServer({
	name: "Betabot Server",
	version: pkg.version
});
server.use(restify.fullResponse());
server.use(restify.CORS({
	origins: [config.origins]
}));
server.use(restify.bodyParser({
	mapParams: false
}));
server.use(restify.queryParser());
server.use(restify.gzipResponse());
server.logger = require("jethro");
server.logger.setUTC(true);
server.listen(config.port, config.ipaddress, function () {
	var host = server.address().address;
	var port = server.address().port;
	server.logger("info", "API", "Started on http://" + host + ":" + port);
});
mongoose.connect(config.APIMongoURL, {
	server: {
		auto_reconnect: true
	}
});
server.db = mongoose.connection;
server.db.on("error", function (err) {
	server.logger("error", "API", "MongoDB connection error:" + err);
});
server.db.on("connected", function () {
	server.logger("info", "API", "MongoDB connected!");
});
server.db.on("disconnected", function () {
	server.logger("warning", "API", "MongoDB disconnected!");
	mongoose.connect(config.APIMongoURL, {
		server: {
			auto_reconnect: true
		}
	});
});
server.db.on("reconnected", function () {
	server.logger("info", "BOT", "MongoDB reconnected!");
});
require("./models")(server, mongoose);
require("./routes")(server);
