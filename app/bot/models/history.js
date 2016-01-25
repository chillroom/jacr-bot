module.exports = function(bot, mongoose) {
    var historySchema = new mongoose.Schema({
        _song: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "song",
            required: true
        },
        _person: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "person",
            required: true
        },
        time: {
            type: Date,
            default: Date.now
        }
    });
    bot.db.model("history", historySchema);
};