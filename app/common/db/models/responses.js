module.exports = (db, mongoose) => {
    const responseSchema = new mongoose.Schema({
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
