"use strict";

module.exports = (req, reply) => {
    req.server.db.models.history.find().sort({"time": -1}).limit(1).populate("_person").populate("_song").exec(function(err, docs) {
        if (err) {
            req.server.logger("error", "MONGO", err);
        } else {
            reply({
                statusCode: 200,
                data: {
                    song: docs[0]._song.name,
                    dj: docs[0]._person.username,
                    time: docs[0].time
                }
            });
        }
    });
};
