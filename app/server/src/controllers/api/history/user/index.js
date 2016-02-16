"use strict";

module.exports = (req, reply) => {
    req.server.db.models.history.find({"_person": req.params.user}).sort({time: -1}).populate("_song", "name fkid").exec(function(err, docs) {
        if (err) {
            req.server.logger("error", "MONGO", err);
        } else {
            reply({
                statusCode: 200,
                data: docs
            });
        }
    });
};
