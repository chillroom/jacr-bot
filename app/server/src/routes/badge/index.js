"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/badge");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/badge.svg",
        handler: controller
    });
};