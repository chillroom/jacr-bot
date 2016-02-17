module.exports = function(db, mongoose) {
    var sessionSchema = new mongoose.Schema({
        jti: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        expireAt: {
            type: Date,
            required: true
        }
    });
    sessionSchema.index({
        jti: 1
    });
    db.model("sessions", sessionSchema);
};
