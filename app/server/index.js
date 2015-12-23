var restify = require("restify"),
	config = require(process.cwd() + "/config"),
	pkg = require(process.cwd() + "/package.json");

var server = restify.createServer({
	name: "Betabot Server",
	version: pkg.version
});
server.use(restify.CORS({
	origins: ["http://just-a-chill-room.net"]
}));
server.use(restify.fullResponse());
server.use(restify.bodyParser({
	mapParams: false
}));
server.use(restify.gzipResponse());
server.logger = require("jethro");
server.logger.setUTC(true);
server.listen(config.port, config.ipaddress, function () {
	var host = server.address().address;
	var port = server.address().port;
	server.logger("info", "API", "Started on http://" + host + ":" + port);
});

require("./routes")(server);
