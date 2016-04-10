"use strict";

const controller = require(process.cwd() + "/server/src/controllers/badge-social");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/badge-social.svg",
        config: {
            auth: false
        },
        handler: controller
    });
};
