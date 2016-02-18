module.exports = (db, mongoose) => {
    const staticCommandSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        arguements: [],
        description: String,
        category: {
            type: String,
            validate: {
                validator: (v) => {
                    return /fun|helpful|info|memes|mod/.test(v);
                },
                message: "\"{VALUE} is not allowed. Please use \"fun\", \"helpful\", \"info\", \"memes\", \"mod\""
            }
        }
    });
    staticCommandSchema.index({
        name: 1
    });
    db.model("staticCommands", staticCommandSchema);
};
