"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/api/currentSong");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/api/current-song",
        handler: controller
    });
};
