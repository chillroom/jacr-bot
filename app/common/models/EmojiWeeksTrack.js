module.exports = function(bot, mongoose) {
    var emojiWeeksTrackSchema = new mongoose.Schema({
        emojis: [{
            emojiName: {
                type: String
            },
            count: {
                type: Number,
                default: 0
            }
        }],
        count: {
            type: Number,
            default: 0
        }
    });
    db.model("emojiTrackWeeks", emojiWeeksTrackSchema);
};
