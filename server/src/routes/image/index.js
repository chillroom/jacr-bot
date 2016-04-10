"use strict";

const controller = require(process.cwd() + "/server/src/controllers/image");

module.exports = (server) => {
    server.route([{
        method: "GET",
        path: "/image",
        config: {
            auth: false,
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
            auth: false,
            cache: {
                expiresIn: 2628000,
                privacy: "public"
            }
        },
        handler: controller.get
    }]);
};
