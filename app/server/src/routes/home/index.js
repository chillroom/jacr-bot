"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/home");

module.exports = (server) => {
	server.route({
		method: "GET",
		path: "/",
		handler: controller
	});
};