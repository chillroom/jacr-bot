"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/api/history/user");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/api/history/{user}",
        config: {
            auth: false
        },
        handler: controller
    });
};
