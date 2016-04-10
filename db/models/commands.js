module.exports = (db, mongoose) => {
    const commandSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        arguements: [],
        cmdType: {
            type: String,
            required: true,
            validate: {
                validator: (v) => {
                    return /^img|txt|info$/.test(v);
                },
                message: "\"{VALUE}\" is not allowed. Please use \"img\", \"txt\" or \"info\"."
            }
        },
        response: [],
        alias: [],
        aliasOf: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "commands"
        },
        description: String,
        category: {
            type: String,
            validate: {
                validator: (v) => {
                    return /^fun|helpful|info|memes|mod$/.test(v);
                },
                message: "\"{VALUE}\" is not allowed. Please use \"fun\", \"helpful\", \"info\", \"memes\", \"mod\"."
            }
        }
    });
    commandSchema.index({
        name: 1
    });
    db.model("commands", commandSchema);
};
