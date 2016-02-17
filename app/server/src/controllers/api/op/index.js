"use strict";

module.exports = (req, reply) => {
    const songs = req.server.db.models.songs;
    songs.aggregate([{
        $match: {
            plays: {
                $gt: 4
            }
        }
    }, {
        $group: {
            _id: null,
            avgPlays: {
                $avg: "$plays"
            }
        }
    }])
    .exec((err, avg) => {
        if (err) {
            req.server.logger("error", "MONGO", err);
        } else {
            var date = new Date() - (1000 * 60 * 60 * 24 * 14);
            var compare = new Date(date);
            songs.find({
                plays: {
                    $gt: avg[0].avgPlays
                },
                lastPlay: {
                    $gte: compare
                }
            }, {
                name: 1,
                plays: 1,
                lastPlay: 1,
                fkid: 1
            })
            .sort({plays: -1})
            .exec((err, songs) => {
                if (err) {
                    req.server.logger("error", "MONGO", err);
                } else {
                    reply({
                        statusCode: 200,
                        data: songs
                    });
                }
            });
        }
    });
};
