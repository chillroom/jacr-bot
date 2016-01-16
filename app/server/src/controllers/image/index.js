"use strict";

const request = require("request");

module.exports = {
	upload: (req, reply) => {
		const url = req.query.url;
		let ext = req.query.ext;
		if (!url) {
			reply({
				status: 400,
				code: "missing_param",
				message: "url param missing"
			}).code(400);
		} else {
			if (!ext) {
				let preExt = url.split(".");

				if (preExt[preExt.length - 1] === "jpg" || "png" || "svg" || "gif") {
					ext = preExt[preExt.length - 1];
				} else {
					ext = "png";
				}
			}
			const db = req.server.plugins["hapi-mongodb"].db;
			db.collection("images").findOne({
				url: url
			}, (err, doc) => {
				if (err) {
					reply({
						status: 500,
						code: "something_wrong",
						message: "Something went wrong"
					}).code(500);
				} else {
					if (doc) {
						reply({
							status: 200,
							code: "image_found",
							message: "Image found",
							data: {
								image: "https://api.plugable.info/image/" + doc._id + "." + doc.ext
							}
						});
					} else {
						db.collection("images").insert({
							url: url,
							ext: ext
						}, (err, doc) => {
							if (err) {
								reply({
									status: 500,
									code: "something_wrong",
									message: "Something went wrong"
								}).code(500);
							} else {
								reply({
									status: 201,
									code: "image_created",
									message: "Image has been created",
									data: {
										image: "https://api.plugable.info/image/" + doc.ops[0]._id + "." + doc.ops[0].ext
									}
								}).code(201);
							}
						});
					}
				}
			});
		}
	},
	get: (req, reply) => {
		const id = req.params.id.split(".")[0];
		const ext = req.params.id.split(".")[1];
		const db = req.server.plugins["hapi-mongodb"].db;
		const ObjectID = req.server.plugins["hapi-mongodb"].ObjectID;
		db.collection("images").findOne({
			_id: ObjectID(id)
		}, (err, doc) => {
			if (err) {
				reply({
					status: 500,
					code: "something_wrong",
					message: "Something wrong"
				});
			} else {
				if (!doc) {
					reply({
						status: 404,
						code: "not_found",
						message: "Image not found"
					}).code(404);
				} else {
					if (doc.ext === ext) {
						request.get({
							url: doc.url,
							encoding: null
						}, (err, resp, body) => {
							if (!err && resp.statusCode === 200) {
								if (ext === "jpg") {
									reply(body).header("Content-Type", "image/jpeg");
								} else if (ext === "png") {
									reply(body).header("Content-Type", "image/png");
								} else if (ext === "svg") {
									reply(body).header("Content-Type", "image/svg+xml");
								} else if (ext === "gif") {
									reply(body).header("Content-Type", "image/gif");
								} else {
									reply({
										status: 400,
										code: "invalid_extension",
										message: "Ivalid image extension"
									}).code(400);
								}
							} else {
								reply({
									status: 500,
									code: "something_wrong",
									message: "Something went wrong"
								});
							}
						});
					} else {
						reply({
							status: 404,
							code: "not_found",
							message: "Image not found"
						}).code(404);
					}
				}
			}
		});
	}
};
