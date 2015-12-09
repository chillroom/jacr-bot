module.exports = function (bot, mongoose) {
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
		}
	});
	personSchema.index({
		name: 1,
		uid: 1
	});
	bot.db.model("person", personSchema);
};
