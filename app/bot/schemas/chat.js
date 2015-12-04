module.exports = function (bot, mongoose) {
	var chatSchema = new mongoose.Schema({
		username: {
			type: String,
			index: true
		},
		chatid: {
			type: String
		},
		time: {
			type: Date,
			default: Date.now
		}
	});
	chatSchema.index({
		username: 1
	});
	bot.db.model("Chat", chatSchema);
};
