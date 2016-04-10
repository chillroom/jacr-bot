"use strict";

const controller = require(process.cwd() + "/server/src/controllers/api/op");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/api/op",
        config: {
            auth: false
        },
        handler: controller
    });
};
