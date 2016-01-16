"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/image");

module.exports = (server) => {
	server.route([
		{
			method: "GET",
			path: "/image",
			handler: controller.upload
		}, {
			method: "POST",
			path: "/image/{id}",
			handler: controller.get
		}
	]);
};
