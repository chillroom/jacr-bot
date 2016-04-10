"use strict";

const controller = require(process.cwd() + "/server/src/controllers/api/currentSong");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/api/current-song",
        config: {
            auth: false
        },
        handler: controller
    });
};