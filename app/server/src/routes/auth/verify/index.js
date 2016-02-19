"use strict";
const Joi = require("joi");
const controller = require(process.cwd() + "/app/server/src/controllers/auth/verify");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/auth/verify/{email}/{token}",
        config: {
            auth: false,
            validate: {
                params: {
                    email: Joi.string().lowercase().email(),
                    token: Joi.string().hex().max(16)
                }
            }
        },
        handler: controller
    });
};
