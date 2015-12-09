module.exports = function (bot, mongoose) {
	var emojiCountSchema = new mongoose.Schema({
		emoji: {
			type: String,
			index: true,
			unique: true
		},
		count: {
			type: Number,
			default: 0
		}
	});
	emojiCountSchema.index({
		emoji: 1
	});
	bot.db.model("emojiCount", emojiCountSchema);
};
