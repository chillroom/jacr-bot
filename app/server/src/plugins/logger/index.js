"use strict";

const Logger = require("jethro");
const Hoek = require("hoek");
const Joi = require("joi");

const internals = {};

internals.defaults = {
    location: "undefined",
    timeformat: "undefined",
    output: {
        colour: true,
        timestamp: true,
        console: true,
        timestampOpts: {
            brackets: false,
            utc: false
        }
    }
};

internals.schema = Joi.object({
    location: Joi.string(),
    timeformat: Joi.string(),
    output: {
        colour: Joi.boolean(),
        console: Joi.boolean(),
        timestampOpts: {
            brackets: Joi.boolean(),
            utc: Joi.boolean()
        }
    }
});

module.exports.register = (server, options, next) => {
    Joi.assert(options, internals.schema);
    const config = Hoek.applyToDefaults(internals.defaults, options);
    server.decorate("server", "logger", Logger);
    server.logger.set(config);
    next();
};

module.exports.register.attributes = {
    name: "logger"
};
