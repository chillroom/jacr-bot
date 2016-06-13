module.exports = (db, mongoose) => {
    const personSchema = new mongoose.Schema({
        username: {
            type: String,
            index: true
        },
        uid: {
            type: String,
            unique: true
        },
        dubs: {
            type: Number,
            default: 0
        },
        lastChat: {
            type: Date
        },
        rank: {
            name: {
                type: String
            },
            rid: {
                type: String
            }
        }
    });
    personSchema.index({
        name: 1,
        uid: 1
    });
    db.model("person", personSchema);
};
