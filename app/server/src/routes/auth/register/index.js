"use strict";

const Joi = require("joi");
const controller = require(process.cwd() + "/app/server/src/controllers/auth/register");

module.exports = (server) => {
    server.route({
        method: "POST",
        path: "/auth/register",
        config: {
            auth: "jwt",
            plugins: {
                hapiAuthorization: {
                  roles: ["ADMIN", "MANAGER"]
              }
            },
            validate: {
                payload: {
                    username: Joi.string().min(3).max(16).required(),
                    email: Joi.string().lowercase().email().required(),
                    password: Joi.string().regex(/^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])[\w\d!£€@#$%_]{10,}$/).options({
                        language: {
                            string: {
                                regex: {
                                    base: "must contain one uppercase, one lowercase, one special character and be at least 10 characters long."
                                }
                            }
                        }
                    }).required(),
                    role: Joi.string().regex(/^MANAGER|EDITOR$/).options({
                        language: {
                            string: {
                                regex: {
                                    base: "invalid."
                                }
                            }
                        }
                    }).required()
                }
            }
        },
        handler: controller
    });
};
