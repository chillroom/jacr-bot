"use strict";

const Joi = require("joi");
const controller = require(process.cwd() + "/app/server/src/controllers/auth/forgot");

module.exports = (server) => {
    server.route({
        method: "POST",
        path: "/auth/forgot",
        config: {
            auth: false,
            validate: {
                payload: {
                    email: Joi.string().lowercase().email().required()
                }
            }
        },
        handler: controller
    });
};
