module.exports = (db, mongoose) => {
    const sessionSchema = new mongoose.Schema({
        jti: {
            type: String,
            required: true,
            validate: {
                validator: (v) => {
                    return /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(v);
                },
                message: "\"{VALUE}\" is not valid UUID v4."
            }
        },
        username: {
            type: String,
            required: true
        },
        expireAt: {
            type: Date,
            required: true
        },
        role: {
            type: String,
            required: true,
            validate: {
                validator: (v) => {
                    return /^ADMIN|MANAGER|EDITOR$/.test(v);
                },
                message: "\"{VALUE}\" is not allowed. Valid roles: \"ADMIN\", \"MANAGER\" and \"EDITOR\"."
            }
        }
    });
    sessionSchema.index({
        jti: 1
    });
    db.model("sessions", sessionSchema);
};
