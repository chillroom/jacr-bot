"use strict";
const Joi = require("joi");
const controller = require(process.cwd() + "/app/server/src/controllers/auth/logout");

module.exports = (server) => {
    server.route({
        method: "GET, DELETE",
        path: "/auth/logout",
        config: {
            auth: "jwt"
        },
        handler: controller
    });
};
