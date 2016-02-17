"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/invite");

module.exports = (server) => {
    server.route({
        method: "POST",
        path: "/invite",
        config: {
            auth: false
        },
        handler: controller
    });
};
