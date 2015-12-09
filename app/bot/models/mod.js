module.exports = function (bot, mongoose) {
	var modSchema = new mongoose.Schema({
		_person: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "person",
			required: true
		},
		rank: {
			name: {
				type: String,
			},
			rid: {
				type: String
			}
		},
		banCount: {
			type: Number,
			default: 0
		}
	});
	bot.db.model("mod", modSchema);
};
