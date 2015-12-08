module.exports = function (bot, mongoose) {
	var settingsSchema = new mongoose.Schema({
		id: {
			type: String,
			unique: true
		},
		motd: {
			msg: {
				type: String
			},
			interval: {
				type: Number,
				default: 15
			},
			enabled: {
				type: Boolean,
				default: false
			}
		},
		emoji: {
			paused: {
				type: Boolean,
				default: false
			},
			reset: {
				type: Boolean,
				default: false
			}
		},
		songCount: {
			type: Number,
			default: 0
		}
	});
	bot.db.model("settings", settingsSchema);
};
