module.exports = (db, mongoose) => {
    const settingsSchema = new mongoose.Schema({
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
            nextRaffleSong: {
                type: Number,
                default: -1
            },
            users: []
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
