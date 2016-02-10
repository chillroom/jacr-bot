"use strict";

const db = require(process.cwd() + "/app/common/index.js");

module.exports.register = (server, options, next) => {
    server.decorate("server", "db", db);
    next();
};

module.exports.register.attributes = {
    name: "db"
};
