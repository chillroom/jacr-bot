"use strict";

const controller = require(process.cwd() + "/app/server/src/controllers/auth/session");

module.exports = (server) => {
    server.route({
        method: "GET",
        path: "/auth/session",
        config: {
          auth: "jwt",
          state: {
              parse: true,
              failAction: "error"
          }
        },
        handler: controller
    });
};
