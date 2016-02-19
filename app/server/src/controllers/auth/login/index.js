"use strict";
const Bcrypt = require("bcryptjs");
const Aguid = require("aguid");
const Boom = require("boom");
const JWT = require("jsonwebtoken");
const config = require(process.cwd() + "/config");

module.exports = (req, reply) => {
    const db = req.server.db;
    db.models.accounts.findOne({
        email: Aguid(req.payload.email)
    }, (err, doc) => {
        if (err) {
            req.server.logger("error", "MONGO", err);
            reply(Boom.badImplementation());
        } else {
            if (doc) {
                if (!doc.verify.verified) {
                    reply(Boom.badRequest("Please verify your email address before logging in."));
                } else {
                    Bcrypt.compare(req.payload.password, doc.password, (err, isValid) => {
                        if (err) {
                            req.server.logger("error", "BCRYPT", err);
                            reply(Boom.badImplementation());
                        } else {
                            if (isValid) {
                                const expire = Date.now() + config.jwt.ttl;
                                const session_data = {
                                    expireAt: expire,
                                    jti: Aguid(),
                                    username: doc.username,
                                    role: doc.role
                                };
                                db.models.sessions.create(session_data, (err) => {
                                    if (err) {
                                        req.server.logger("error", "MONGO", err);
                                        reply(Boom.badImplementation());
                                    } else {
                                        const token = JWT.sign(session_data, config.jwt.key, {
                                            algorithm: "HS512"
                                        });
                                        reply({
                                            statusCode: 200,
                                            message: "Sucessfully signed in.",
                                            token: token
                                        }).header("Authorization", token).state("token", token);
                                    }
                                });
                            } else {
                                reply(Boom.badRequest("Invalid password."));
                            }
                        }
                    });
                }
            } else {
                reply(Boom.badRequest("Email address provided cannot be found."));
            }
        }
    });
};
