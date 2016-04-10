"use strict";

const db = require(process.cwd() + "/db");

module.exports.register = (server, options, next) => {
    server.decorate("server", "db", db);
    next();
};

module.exports.register.attributes = {
    name: "db"
};
