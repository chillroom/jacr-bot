module.exports = function (bot, mongoose) {
	var chatSchema = new mongoose.Schema({
		username: {
			type: String
		},
		chatid: {
			type: String
		},
		time: {
			type: Date,
			default: Date.now
		}
	});
	bot.db.model("Chat", chatSchema);
};
