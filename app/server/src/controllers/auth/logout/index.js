"use strict";
const Bcrypt = require("bcryptjs");
const Aguid = require("aguid");
const Boom = require("boom");
const JWT = require("jsonwebtoken");
const config = require(process.cwd() + "/config");

module.exports = (req, reply) => {
    const sessions = req.server.db.models.sessions;
    sessions.findOne({
        jti: req.auth.credentials.jti
    }, (err, doc) => {
        if (err) {
            req.server.logger("error", "MONGO", err);
        } else {
            if (doc) {
                doc.remove(();
                reply({
                    statusCode: 200,
                    message: "Successfully logged out."
                });
            } else {
                reply({
                    statusCode: 200,
                    message: "Successfully logged out."
                });
            }
        }
    });
};
