var request = require("request"),
	config = require(process.cwd() + "/config");

module.exports = function (server) {
	server.get("/image/:id", function (req, res, next) {
		var id = req.params.id.split(".")[0];
		server.db.models.image.findOne({
			_id: id
		}, function (err, doc) {
			if (err) {
				server.logger("error", "API", err);
			} else {
				if (!doc) {
					res.status(404);
					res.json({
						code: "image_not_found"
					});
					next();
				} else {
					request.get({
						url: doc.url,
						encoding: null
					}, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							res.writeHead("200", {
								"Content=Type": "image/jpeg",
								"Cache-Control": "max-age=0, no-cache"
							});
							res.end(body);
							next();
						}
					});
				}
			}
		});
	});
	server.post("/image", function (req, res, next) {
		if (req.query.url) {
			var image = decodeURIComponent(req.query.url);
			server.db.models.image.findOne({
				url: image
			}, function (err, doc) {
				if (err) {
					server.logger("error", "API", err);
				} else {
					if (!doc) {
						server.db.models.image.create({
							url: image
						}, function (error, doc) {
							if (err) {
								server.logger("error", "API", error);
								res.status(500);
								res.json("image_error");
								next();
							} else {
								res.json({
									code: "image_created",
									message: doc
								});
								next();
							}
						});
					} else {
						res.json({
							code: "image_created",
							message: doc
						});
						next();
					}
				}
			});
		} else {
			res.status(404);
			res.json({
				code: "no_url"
			});
		}
	});
};
