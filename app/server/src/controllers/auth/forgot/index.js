"use strict";

const Bcrypt = require("bcryptjs");
const Crypto = require("crypto");
const Aguid = require("aguid");
const Boom = require("boom");

module.exports = (req, reply) => {
    const accounts = req.server.db.models.accounts;
    accounts.findOne({
        email: Aguid(req.payload.email)
    }, (err, doc) => {
        if (err) {
            req.server.logger("error", "MONGO", JSON.stringify(err));
            reply(Boom.badImplementation(err));
        }
        else {
            if (doc) {
                const buf = Crypto.randomBytes(8);
                const token = buf.toString("hex");
                Bcrypt.genSalt(10, token, (err, salt) => {
                    if (err) {
                        req.server.logger("error", "BCRYPT", err);
                        reply(Boom.badImplementation(err));
                    } else {
                        Bcrypt.hash(token, salt, (err, hash) => {
                            doc.reset.token = hash;
                            doc.save((err, doc) => {
                                if (err) {
                                    req.server.logger("error", "MONGO", JSON.stringify(err));
                                    reply(Boom.badImplementation(err));
                                } else {
                                    const mailer = req.server.plugins["mailer"];
                                    const send_data = {
                                        from: "IllumiBot <no_reply@plugable.info>",
                                        to: req.payload.email,
                                        subject: "Reset Password",
                                        html: {
                                            template: "reset.html"
                                        },
                                        text: {
                                            template: "reset.txt"
                                        },
                                        context: {
                                            username: doc.username,
                                            link: "http://" + req.headers.host + "/auth/reset/" + req.payload.email + "/" + token,
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
                        });
                    }
                });
            }
        }
    });
};
