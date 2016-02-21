"use strict";

module.exports = (req, reply) => {
    const sessions = req.server.db.models.sessions;
    sessions.findOne({
        jti: req.auth.credentials.jti
    }, (err, doc) => {
        if (err) {
            req.server.logger("error", "MONGO", err);
        } else {
            if (doc) {
                doc.remove();
                reply({
                    statusCode: 200,
                    message: "Successfully logged out."
                }).unstate("token");
            } else {
                reply({
                    statusCode: 200,
                    message: "Successfully logged out."
                });
            }
        }
    });
};
