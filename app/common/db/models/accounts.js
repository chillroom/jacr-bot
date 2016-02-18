module.exports = (db, mongoose) => {
    const accountSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            validate: {
                validator: (v) => {
                    return /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(v);
                },
                message: "\"{VALUE}\" is not valid UUID v4."
            }
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
        },
        password: {
            type: String,
            required: true
        },
        verify: {
            verified: {
                type: Boolean
            },
            token: String
        }
    });
    accountSchema.index({
        username: 1,
        email: 1
    });
    db.model("acounts", accountSchema);
};
