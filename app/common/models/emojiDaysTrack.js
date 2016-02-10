module.exports = function(db, mongoose) {
    var emojiDaysTrackSchema = new mongoose.Schema({
        emojis: [{
            emojiName: {
                type: String
            },
            count: {
                type: Number,
                default: 0
            }
        }],
        time: {
            type: Date,
            default: Date.now
        }
    });
    db.model("emojiTrackDays", emojiDaysTrackSchema);
};
