"use strict";

const Bcrypt = require("bcryptjs");
const Crypto = require("crypto");
const Aguid = require("aguid");
const Boom = require("boom");

module.exports = (req, reply) => {
    const db = req.server.db;
    const buf = Crypto.randomBytes(8);
    const token = buf.toString("hex");
    let passwordHash;
    let tokenHash;
    db.models.accounts.findOne({
        email: Aguid(req.payload.email)
    }, (err, doc) => {
        if (err) {
            req.server.logger("error", "MONGO", JSON.stringify(err));
            reply(Boom.badImplementation(err));
        } else {
            if (doc) {
                reply(Boom.conflict("Email address already in use."));
            } else {
                Bcrypt.genSalt(10, (err, passwordSalt) => {
                    if (err) {
                        req.server.logger("error", "BCRYPT", err);
                    } else {
                        Bcrypt.hash(req.payload.password, passwordSalt, (err, passHash) => {
                            passwordHash = passHash;
                            if (err) {
                                req.server.logger("error", "BCRYPT", err);
                                reply(Boom.badImplementation());
                            } else {
                                Bcrypt.genSalt(10, (err, tokenSalt) => {
                                    if (err) {
                                        reply(Boom.badImplementation());
                                        req.server.logger("error", "BCRYPT", err);
                                    } else {
                                        Bcrypt.hash(token, tokenSalt, (err, tokHash) => {
                                            tokenHash = tokHash;
                                            if (err) {
                                                req.server.logger("error", "BCRYPT", JSON.stringify(err));
                                                reply(Boom.badImplementation(err));
                                            } else {
                                                const user_data = {
                                                    username: req.payload.username,
                                                    email: Aguid(req.payload.email),
                                                    password: passwordHash,
                                                    role: req.payload.role,
                                                    verify: {
                                                        verified: false,
                                                        token: tokenHash
                                                    }
                                                };
                                                db.models.accounts.create(user_data, (err, doc) => {
                                                    if (err) {
                                                        req.server.logger("error", "MONGO", JSON.stringify(err));
                                                        reply(Boom.badImplementation(err));
                                                    } else {
                                                        const mailer = req.server.plugins["mailer"];
                                                        const send_data = {
                                                            from: "IllumiBot <support@plugable.info>",
                                                            to: req.payload.email,
                                                            subject: "Email Verification",
                                                            html: {
                                                                template: "verify.html"
                                                            },
                                                            text: {
                                                                template: "verify.txt"
                                                            },
                                                            context: {
                                                                username: req.payload.username,
                                                                link: "http://" + req.headers.host + "/auth/verify/" + req.payload.email + "/" + token,
                                                                email: req.payload.email
                                                            }
                                                        };
                                                        mailer.send(send_data, (err) => {
                                                            if (err) {
                                                                doc.remove();
                                                                req.server.logger("error", "MAILER", JSON.stringify(err));
                                                                reply(Boom.badImplementation(err));
                                                            } else {
                                                                reply({
                                                                    statusCode: 200,
                                                                    message: "Account created. Please verify your email address before logging into your account."
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
};
