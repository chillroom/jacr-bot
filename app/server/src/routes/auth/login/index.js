"use strict";
const Joi = require("joi");
const controller = require(process.cwd() + "/app/server/src/controllers/auth/login");

module.exports = (server) => {
    server.route({
        method: "POST",
        path: "/auth/login",
        config: {
            auth: false,
            validate: {
                payload: {
                    email: Joi.string().lowercase().email().required(),
                    password: Joi.string().required()
                }
            }
        },
        handler: controller
    });
};
