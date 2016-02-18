"use strict";
const Joi = require("joi");
const controller = require(process.cwd() + "/app/server/src/controllers/auth/register");

module.exports = (server) => {
	            server.route({
		            method: "POST",
		            path: "/auth/register",
		            config: {
			            auth: false,
			            validate: {
				            payload: {
					            username: Joi.string().required(),
					            email: Joi.string().lowercase().email().required(),
					            password: Joi.string().regex(/^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])[\w\d!£€@#$%_]{10,}$/).required(),
    role: Joi.string().rgex(/^MANAGER|EDITOR$/).required()
				}
			}
		},
		            handler: controller
	});
};
