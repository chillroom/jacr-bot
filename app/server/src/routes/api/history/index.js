"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/api/history");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/api/history",
        handler: controller
    });
};
