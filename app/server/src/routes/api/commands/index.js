"use strict";

const Joi = require("joi");
const controller = require(process.cwd() + "/app/server/src/controllers/api/commands");

module.exports = (server) => {
    server.route([
        {
            method: "GET",
            path: "/api/commands",
            handler: controller.get
        }, {
            method: "POST",
            path: "/api/commands/add",
            config: {
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
                validate: {
                    payload: {
                        name: Joi.string().required(),
                        alias: Joi.string().required()
                    }
                }
            },
            handler: controller.alias
        }
    ]);
};
