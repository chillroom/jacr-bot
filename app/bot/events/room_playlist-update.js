module.exports = function (bot) {
	bot.on("room_playlist-update", function () {
		bot.sendMotd();
		var date = new Date();
		//for the off chance that the bot is started for the first time during a period where it needs to track emojis
		//need to set a time out to make sure the settings in bot.sendMotd() has been created.
		setTimeout(function () {
			//checks to see if it's within the first hour of the day
			if (date.getUTCHours() === 0) {
				bot.db.models.settings.findOne({
					id: "s3tt1ng5"
				}, function (err, doc) {
					if (err) {
						bot.log("error", "BOT", err);
					}
					if (!doc.emoji.paused) {
						var emojis = [];
						bot.emojis.forEach(function (emoji, index, arr) {
							bot.db.models.emojiCount.findOne({
								emoji: emoji
							}, function (err, doc) {
								if (err) {
									bot.log("error", "BOT", err);
								}
								if (doc) {
									var count = {
										emojiName: emoji,
										count: doc.count
									};
									emojis.push(count);
									doc.count = 0;
									doc.save();
								}
							});
							if (index === arr.length - 1) {
								setTimeout(function () {
									bot.db.models.emojiTrackDays.create({
										emojis: emojis
									}, function (err) {
										if (err) {
											bot.log("error", "BOT", err);
										}

									});
								}, 5000);
							}
						});
						doc.emoji.paused = true;
						doc.save();
					}
				});

				bot.db.models.chat.find({}).sort({
					time: -1
				}).skip(100).remove().exec(function (err) {
					if (err) {
						bot.log("error", "BOT", err);
					}
				});
			} else {
				bot.db.models.settings.findOne({
					id: "s3tt1ng5"
				}, function (err, doc) {
					if (err) {
						bot.log("error", "BOT", err);
					}
					if (doc.emoji.paused) {
						doc.emoji.paused = false;
						doc.save();
					}
				});
			}
		}, 5000);
	});
};
