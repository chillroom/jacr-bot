"use strict";

const pkg = require(process.cwd() + "/package.json");

module.exports = (req, reply) => {
	reply({
		status: 200,
		code: "online",
		message: "Bot API server online",
		version: pkg.version
	});
};
