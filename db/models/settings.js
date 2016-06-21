module.exports = (db, mongoose) => {
    const settingsSchema = new mongoose.Schema({
        id: {
            type: String,
            unique: true
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
