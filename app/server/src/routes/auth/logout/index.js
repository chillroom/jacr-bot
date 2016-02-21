"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/auth/logout");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/auth/logout",
        config: {
            auth: "jwt"
        },
        handler: controller
    });
};
