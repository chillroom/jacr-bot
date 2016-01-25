"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/image");

module.exports = (server) => {
    server.route([{
        method: "GET",
        path: "/image",
        config: {
            cache: {
                expiresIn: 2628000,
                privacy: "public"
            }
        },
        handler: controller.upload
    }, {
        method: "GET",
        path: "/image/{id}",
        config: {
            cache: {
                expiresIn: 2628000,
                privacy: "public"
            }
        },
        handler: controller.get
    }]);
};