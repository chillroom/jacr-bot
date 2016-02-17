module.exports = function(db, mongoose) {
    var responseSchema = new mongoose.Schema({
        category: {
            type: String,
            required: true
        },
        sub: String,
        response: []
    });
    responseSchema.index({
        name: 1
    });
    db.model("responses", responseSchema);
};
