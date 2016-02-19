"use strict";
const Bcrypt = require("bcryptjs");
const Aguid = require("aguid");
const Boom = require("boom");

module.exports = (req, reply) => {
    const accounts = req.server.db.models.accounts;
    accounts.findOne({
        email: Aguid(req.params.email)
    }, (err, doc) => {
        if (err) {
            req.server.logger("error", "MONGO", err);
            reply(Boom.badImplementation());
        } else {
            if (doc) {
                if (!doc.verify.verified) {
                    Bcrypt.compare(req.params.token, doc.verify.token, (err, isValid) => {
                        if (err) {
                            req.server.logger("error", "BCRYPT", err);
                            reply(Boom.badImplementation());
                        } else {
                            if (isValid) {
                                doc.verify.verified = true;
                                doc.verify.token = "";
                                doc.save((err) => {
                                    if (err) {
                                        if (err) {
                                            req.server.logger("error", "MONGO", err);
                                            reply(Boom.badImplementation());
                                        }
                                    } else {
                                        reply({
                                            statusCode: 200,
                                            message: "Email address successfully verified. Please log into your account."
                                        });
                                    }
                                });
                            } else {
                                reply(Boom.unauthorized("Invalid token provided."));
                            }
                        }
                    });
                } else {
                    reply({
                        statusCode: 200,
                        message: "Email addess already verified. Please log into your account."
                    });
                }
            } else {
                reply(Boom.badRequest("Email address provided is not found."));
            }
        }
    });
};
