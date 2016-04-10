"use strict";

const Boom = require("boom");
const config = require(process.cwd() + "/config");

module.exports = {
    get: (req, reply) => {
        const commands = req.server.db.models.commands;
        commands.find((err, docs) => {
            if (err) {
                req.server.logger("error", "MONGO", JSON.stringify(err));
                reply(Boom.badImplementation(err));
            } else {
                reply({
                    statusCode: 200,
                    data: docs
                });
            }
        });
    },
    add: (req, reply) => {
        const commands = req.server.db.models.commands;
        commands.findOne({
            name: req.payload.name
        }, (err, doc) => {
            if (err) {
                req.server.logger("error", "MONGO", JSON.stringify(err));
                reply(Boom.badImplementation(err)).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                    ttl: config.jwt.ttl
                });
            } else {
                if (doc) {
                    reply(Boom.conflict("Command already exists")).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                        ttl: config.jwt.ttl
                    });
                } else {
                    let resp;
                    if (req.payload.response.indexOf(",") > -1) {
                        resp = req.payload.response.replace(/\s+/g, "").split(",");
                    } else {
                        resp = req.payload.response;
                    }
                    commands.create({
                        name: req.payload.name,
                        response: resp,
                        cmdType: req.payload.type
                    }, (err) => {
                        if (err) {
                            req.server.logger("error", "MONGO", JSON.stringify(err));
                            if (err.errors.cmdType) {
                                reply(Boom.badRequest(err.errors.cmdType.message)).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                    ttl: config.jwt.ttl
                                });
                            } else {
                                reply(Boom.badImplementation()).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                    ttl: config.jwt.ttl
                                });
                            }
                        } else {
                            reply({
                                statusCode: 200,
                                message: "Command added"
                            }).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                ttl: config.jwt.ttl
                            });
                        }
                    });
                }
            }
        });
    },
    alias: (req, reply) => {
        const commands = req.server.db.models.commands;
        commands.findOne({
            name: req.payload.alias
        })
        .populate("aliasOf")
        .exec((err, doc) => {
            if (err) {
                req.server.logger("error", "MONGO", JSON.stringify(err));
                reply(Boom.badImplementation(err)).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                    ttl: config.jwt.ttl
                });
            } else {
                if (doc) {
                    if (doc.aliasOf) {
                        if (doc.aliasOf.alias.indexOf(req.payload.name) > -1) {
                            reply(Boom.badRequest("Alias already exists")).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                ttl: config.jwt.ttl
                            });
                        } else {
                            commands.findOne({
                                name: doc.aliasOf.name
                            }, (err, cmd) => {
                                cmd.alias.push(req.payload.name);
                                cmd.save((err, command) => {
                                    if (err) {
                                        req.server.logger("error", "MONGO", JSON.stringify(err));
                                        reply(Boom.badImplementation(err)).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                            ttl: config.jwt.ttl
                                        });
                                    } else {
                                        commands.create({
                                            name: req.payload.name,
                                            aliasOf: command._id,
                                            cmdType: command.cmdType
                                        }, (err) => {
                                            if (err) {
                                                req.server.logger("error", "MONGO", JSON.stringify(err));
                                                reply(Boom.badImplementation(err)).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                                    ttl: config.jwt.ttl
                                                });
                                            } else {
                                                reply({
                                                    statusCode: 200,
                                                    message: "Alias added"
                                                }).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                                    ttl: config.jwt.ttl
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    } else {
                        if (doc.alias.indexOf(req.payload.name) > -1) {
                            reply(Boom.badRequest("Alias already exists")).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                ttl: config.jwt.ttl
                            });
                        } else {
                            doc.alias.push(req.payload.name);
                            doc.save((err, command) => {
                                if (err) {
                                    req.server.logger("error", "MONGO", JSON.stringify(err));
                                    reply(Boom.badImplementation(err)).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                        ttl: config.jwt.ttl
                                    });
                                } else {
                                    commands.create({
                                        name: req.payload.name,
                                        aliasOf: command._id,
                                        cmdType: command.cmdType
                                    }, (err) => {
                                        if (err) {
                                            req.server.logger("error", "MONGO", JSON.stringify(err));
                                            reply(Boom.badImplementation(err)).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                                ttl: config.jwt.ttl
                                            });
                                        } else {
                                            reply({
                                                statusCode: 200,
                                                message: "Alias added"
                                            }).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                                                ttl: config.jwt.ttl
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                } else {
                    reply(Boom.badRequest("Cannot create alias \"" + req.payload.name + "\" because \"" + req.payload.alias + "\" does not exist")).header("Authorization", req.headers.authorization).state("token", req.state.token, {
                        ttl: config.jwt.ttl
                    });
                }
            }
        });
    },
    image: (req, reply) => {
        const commands = req.server.db.models.commands;
        commands.findOne({
            name: req.payload.name
        })
        .populate("aliasOf")
        .exec((err, doc) => {
            if (doc) {
                if (doc.aliasOf) {
                    commands.findOne({
                        name: doc.aliasOf.name
                    }, (err, cmd) => {
                        cmd.response.push(req.payload.image);
                        cmd.save((err) => {
                            if (err) {
                                reply({
                                    statusCode: 500,
                                    message: "Something went wrong"
                                }).code(500);
                            } else {
                                reply({
                                    statusCode: 200,
                                    message: "Image added"
                                });
                            }
                        });
                    });
                } else {
                    doc.response.push(req.payload.image);
                    doc.save((err) => {
                        if (err) {
                            reply({
                                statusCode: 200,
                                message: "Something went wrong"
                            }).code(500);
                        } else {
                            reply({
                                statusCode: 200,
                                message: "Image added"
                            });
                        }
                    });
                }
            } else {
                reply({
                    statusCode: 400,
                    message: "Command does not exist"
                }).code(400);
            }
        });
    }
};
