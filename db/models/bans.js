module.exports = (db, mongoose) => {
    const banSchema = new mongoose.Schema({
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
    db.model("bans", banSchema);
};
