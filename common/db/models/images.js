module.exports = (db, mongoose) => {
    const imageSchema = new mongoose.Schema({
        url: {
            type: String,
            required: true
        },
        ext: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^jpg|png|svg|gif$/.test(v);
                },
                message: "\"{VALUE} is not allowed. Please use \"jpg\", \"png\", \"svg\", \"gif\""
            }
        }
    });
    imageSchema.index({
        url: 1
    });
    db.model("images", imageSchema);
};
