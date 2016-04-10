"use strict";

const controller = require(process.cwd() + "/server/src/controllers/invite");

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
