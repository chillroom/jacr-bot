module.exports = function(db, mongoose) {
    var banSchema = new mongoose.Schema({
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
    db.model("ban", banSchema);
};
