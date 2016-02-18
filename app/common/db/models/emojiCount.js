module.exports = (db, mongoose) => {
    const emojiCountSchema = new mongoose.Schema({
        emoji: {
            type: String,
            index: true,
            unique: true
        },
        count: {
            type: Number,
            default: 0
        }
    });
    emojiCountSchema.index({
        emoji: 1
    });
    db.model("emojiCount", emojiCountSchema);
};
