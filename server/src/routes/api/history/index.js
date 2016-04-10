"use strict";

const controller = require(process.cwd() + "/server/src/controllers/api/history");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/api/history",
        config: {
            auth: false
        },
        handler: controller
    });
};
