var restify = require('restify'),
	request = require('request'),
	config = require('./config'),
	pkg = require('./package.json');

require('./bot');

var server = restify.createServer({
	name: 'Betabot Server',
	version: pkg.version
});
server.use(restify.CORS({
	origins: [config.origins]
}));
server.use(restify.fullResponse());
server.use(restify.bodyParser({
	mapParams: false
}));
server.use(restify.gzipResponse());
server.listen(config.port, config.ipaddress, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('%s: %s Server started on http://%s:%s', Date(Date.now()), server.name, host, port);
});
server.get('/', function (req, res, next) {
	res.json({
		code: "online",
		message: "JACR Auto Slack Invite API Server OK"
	});
	return next();
});
