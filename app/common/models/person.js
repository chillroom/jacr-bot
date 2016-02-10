module.exports = function(bot, mongoose) {
    var personSchema = new mongoose.Schema({
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
        ban: {
            lastBan: {
                type: Date
            },
            count: {
                type: Number,
                default: 0
            },
            by: {
                type: String
            }
        },
        rank: {
            name: {
                type: String
            },
            rid: {
                type: String
            },
            banCount: {
                type: Number,
                default: 0
            }
        }
    });
    personSchema.index({
        name: 1,
        uid: 1
    });
    db.model("person", personSchema);
};
