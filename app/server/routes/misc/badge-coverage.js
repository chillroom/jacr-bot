var request = require("request"),
	config = require(process.cwd() + "/config");

module.exports = function (server) {
	server.get("/badge-coverage.svg", function (req, res, next) {
		request.get({
			url: "http://" + config.jenkinsUser + ":" + config.jenkinsToken + "@" + config.jenkinsURL + "/lastSuccessfulBuild/cobertura/api/json/?depth=2"
		}, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				var elements = JSON.parse(body)["results"]["elements"];
				for (var i in elements) {
					if (elements[i]["name"] == "Lines") {
						var cov = elements[i]["ratio"].toFixed(2);
						var color = function (cov) {
							if (cov < 20) {
								return "red";
							} else if (cov < 80) {
								return "yellow";
							} else {
								return "brightgreen";
							}
						}(cov);
						request("https://img.shields.io/badge/coverage-" + cov.toString() + "%-" + color + ".svg", function (err, response, body) {
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
				}
			} else {
				request("https://img.shields.io/badge/coverage-none-lightgrey.svg", function (err, response, body) {
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
