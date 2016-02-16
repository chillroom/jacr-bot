module.exports = function(db, mongoose) {
    var settingsSchema = new mongoose.Schema({
        id: {
            type: String,
            unique: true
        },
        motd: {
            msg: {
                type: String
            },
            interval: {
                type: Number,
                default: 15
            },
            enabled: {
                type: Boolean,
                default: false
            }
        },
        raffle: {
            enabled: {
                type: Boolean,
                default: false
            },
            started: {
                type: {
                    Boolean,
                    default: false
                }
            },
            interval: {
                type: Number,
                default: 12
            },
            users: [],
            lockedNumberOne: String
        },
        emoji: {
            paused: {
                type: Boolean,
                default: false
            },
            reset: {
                type: Boolean,
                default: false
            }
        },
        songCount: {
            type: Number,
            default: 0
        }
    });
    settingsSchema.index({
        id: 1
    });
    db.model("settings", settingsSchema);
};
