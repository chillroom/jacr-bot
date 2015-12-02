module.exports = function (bot, mongoose) {
	var emojiCountSchema = new mongoose.Schema({
		emoji: {
			type: String
		},
		count: {
			type: Number,
			default: 0
		}
	});
	bot.db.model('EmojiCount', emojiCountSchema);
}
