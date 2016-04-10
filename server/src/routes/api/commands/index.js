"use strict";

const Joi = require("joi");
const controller = require(process.cwd() + "/server/src/controllers/api/commands");

module.exports = (server) => {
    server.route([{
        method: "GET",
        path: "/api/commands",
        config: {
            auth: false
        },
        handler: controller.get
    }, {
        method: "POST",
        path: "/api/commands/add",
        config: {
            auth: "jwt",
            plugins: {
                hapiAuthorization: {
                    roles: ["ADMIN", "MANAGER", "BOT", "EDITOR"]
                }
            },
            state: {
                parse: true,
                failAction: "error"
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    response: Joi.string().required(),
                    type: Joi.string().required()
                }
            }
        },
        handler: controller.add
    }, {
        method: "POST",
        path: "/api/commands/alias",
        config: {
            auth: "jwt",
            plugins: {
                hapiAuthorization: {
                    roles: ["ADMIN", "MANAGER", "BOT", "EDITOR"]
                }
            },
            state: {
                parse: true,
                failAction: "error"
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    alias: Joi.string().required()
                }
            }
        },
        handler: controller.alias
    }]);
};
