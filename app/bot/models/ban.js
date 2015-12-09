module.exports = function (bot, mongoose) {
	var banSchema = new mongoose.Schema({
		_person: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "person",
			required: true
		},
		time: {
			type: Date,
			default: Date.now
		}
	});
	bot.db.model("ban", banSchema);
};
