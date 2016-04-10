"use strict";

const controller = require(process.cwd() + "/server/src/controllers/home");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/",
        config: {
            auth: false
        },
        handler: controller
    });
};
