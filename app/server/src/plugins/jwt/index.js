"use strict";

const config = require(process.cwd() + "/config");

const internals = {};

internals.verify = (decoded, req, callback) => {
    const sessions = req.server.db;
    sessions.findOne({
        jti: decoded.jti
    }, (err, doc) => {
        if (err) {
            req.server.logger("error", "MONGO", err);
            callback(null, false);
        } else {
            if (doc) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        }
    });
};

module.exports.register = (server, options, next) => {
    server.register({
        register: require("hapi-auth-jwt2")
    }, (err) => {
        if (err) {
            server.logger("error", "API", err);
        } else {
            server.state("token", config.jwt.cookie_options);
            server.auth.strategy("jwt", "jwt", {
                key: config.jwt.key,
                validateFunc: internals.verify,
                verifyOptions: {
                    algorithms: ["HS512"]
                }
            });
            server.auth.default("jwt");
            next();
        }
    });
};

module.exports.register.attributes = {
    name: "jwt"
};
