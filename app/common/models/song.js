module.exports = function(db, mongoose) {
    var songSchema = new mongoose.Schema({
        name: {
            type: String,
            index: true
        },
        fkid: {
            type: String,
            index: true,
            unique: true
        },
        op: {
            type: Boolean,
            default: false
        },
        forbidden: {
            type: Boolean,
            default: false
        },
        nsfw: {
            type: Boolean,
            default: false
        },
        unavailable: {
            type: Boolean,
            default: false
        },
        theme: {
            type: Boolean,
            default: true
        },
        plays: {
            type: Number,
            default: 0
        },
        lastPlay: {
            type: Date
        }
    });
    songSchema.index({
        name: 1,
        fkid: 1
    });
    db.model("song", songSchema);
};