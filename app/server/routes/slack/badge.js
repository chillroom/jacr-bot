var request = require("request"),
	config = require(process.cwd() + "/config");

module.exports = function (server) {
	server.get("/badge.svg", function (req, res, next) {
		request.post({
			url: "https://" + config.slackUrl + "/api/users.list",
			form: {
				token: config.slackToken,
				presence: 1
			}
		}, function (err, response, body) {
			/* istanbul ignore if  */
			if (err) {
				res.json({
					code: "something_wrong",
					message: err
				});
			}
			body = JSON.parse(body);
			/* istanbul ignore else  */
			if (body.ok) {
				var users = body.members;
				users = users.filter(function (x) {
					return !x.is_bot && !x.deleted;
				});
				var total = users.length;
				users = users.filter(function (x) {
					return x.presence === "active";
				});
				var online = users.length;
				request.get("https://img.shields.io/badge/Slack-" + online + "%2F" + total + "-E01563.svg", function (err, response, body) {
					/* istanbul ignore if  */
					if (err) {
						res.json({
							code: "something_wrong",
							message: err
						});
					}
					res.writeHead("200", {
						"Content-Type": "image/svg+xml",
						"Cache-Control": "max-age=0, no-cache"
					});
					res.write(body);
					res.end();
					next();
				});
			}
		});
	});
};
