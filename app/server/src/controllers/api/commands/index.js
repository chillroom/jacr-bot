"use strict";

module.exports = {
    get: (req, reply) => {
        req.server.db.models.commands.find((err, docs) => {
            if (err) {
                req.server.logger("error", "MONGO", JSON.stringify(err));
                reply({
                    statusCode: 500,
                    message: "Something went wrong"
                }).code(500);
            } else {
                reply({
                    statusCode: 200,
                    data: docs
                });
            }
        });
    },
    add: (req, reply) => {
        req.server.db.models.commands.findOne({name: req.payload.name}, (err, doc) => {
            if (err) {
                req.server.logger("error", "MONGO", JSON.stringify(err));
                reply({
                    statusCode: 500,
                    message: "Something went wrong"
                }).code(500);
            } else {
                if (doc) {
                    reply({
                        statusCode: 400,
                        message: "Command already exists"
                    }).code(400);
                } else {
                    let resp;
                    if (req.payload.response.indexOf(",") > -1) {
                        resp = req.payload.response.replace(/\s+/g, "").split(",");
                    } else {
                        resp = req.payload.response;
                    }
                    req.server.db.models.commands.create({name: req.payload.name, response: resp, cmdType: req.payload.type}, (err) => {
                        if (err) {
                            req.server.logger("error", "MONGO", JSON.stringify(err));
                            if (err.errors.cmdType) {
                                reply({
                                    statusCode: 400,
                                    message: err.errors.cmdType.message
                                }).code(400);
                            } else {
                                reply({
                                    statusCode: 500,
                                    message: "Something went wrong"
                                }).code(500);
                            }
                        } else {
                            reply({
                                statusCode: 200,
                                message: "Command added"
                            });
                        }
                    });
                }
            }
        });
    },
    alias: (req, reply) => {
        req.server.db.models.commands.findOne({
            name: req.payload.alias
        }).populate("aliasOf").exec((err, doc) => {
            if (err) {
                req.server.logger("error", "MONGO", JSON.stringify(err));
                reply({
                    statusCode: 500,
                    message: "Something went wrong"
                }).code(500);
            } else {
                if (doc) {
                    if (doc.aliasOf) {
                        if (doc.aliasOf.alias.indexOf(req.payload.name) > -1) {
                            reply({
                                statusCode: 400,
                                message: "Alias already exists"
                            }).code(400);
                        } else {
                            req.server.db.models.commands.findOne({
                                name: doc.aliasOf.name
                            }, (err, cmd) => {
                                cmd.alias.push(req.payload.name);
                                cmd.save((err, command) => {
                                    if (err) {
                                        req.server.logger("error", "MONGO", JSON.stringify(err));
                                        reply({
                                            statusCode: 500,
                                            message: "Something went wrong"
                                        }).code(500);
                                    } else {
                                        req.server.db.models.commands.create({
                                            name: req.payload.name,
                                            aliasOf: command._id,
                                            cmdType: command.cmdType
                                        }, (err) => {
                                            if (err) {
                                                req.server.logger("error", "MONGO", JSON.stringify(err));
                                                reply({
                                                    statusCode: 500,
                                                    message: "Something went wrong"
                                                }).code(500);
                                            } else {
                                                reply({
                                                    statusCode: 200,
                                                    message: "Alias added"
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    } else {
                        if (doc.alias.indexOf(req.payload.name) > -1) {
                            reply({
                                statusCode: 400,
                                message: "Alias already exists"
                            }).code(400);
                        } else {
                            doc.alias.push(req.payload.name);
                            doc.save((err, command) => {
                                if (err) {
                                    req.server.logger("error", "MONGO", JSON.stringify(err));
                                    reply({
                                        statusCode: 500,
                                        message: "Something went wrong"
                                    }).code(500);
                                } else {
                                    req.server.db.models.commands.create({
                                        name: req.payload.name,
                                        aliasOf: command._id,
                                        cmdType: command.cmdType
                                    }, (err) => {
                                        if (err) {
                                            req.server.logger("error", "MONGO", JSON.stringify(err));
                                            reply({
                                                statusCode: 500,
                                                message: "Something went wrong"
                                            }).code(500);
                                        } else {
                                            reply({
                                                statusCode: 200,
                                                message: "Alias added"
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                } else {
                    reply({
                        statusCode: 400,
                        message: "Cannot create alias \"" + req.payload.name + "\" because \"" + req.payload.alias + "\" does not exist"
                    }).code(400);
                }
            }
        });
    },
    image: (req, reply) => {
        req.server.db.models.commands.findOne({
            name: req.payload.name
        }).populate("aliasOf").exec((err, doc) => {
            if (doc) {
                if (doc.aliasOf) {
                    req.server.db.models.commands.findOne({
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
