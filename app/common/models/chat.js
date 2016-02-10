module.exports = function(db, mongoose) {
    var chatSchema = new mongoose.Schema({
        username: {
            type: String,
            index: true,
            required: true
        },
        chatid: {
            type: String,
            index: true,
            required: true
        },
        time: {
            type: Date,
            default: Date.now
        }
    });
    chatSchema.index({
        username: 1
    });
    db.model("chat", chatSchema);
};