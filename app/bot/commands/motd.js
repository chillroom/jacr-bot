module.exports = function (bot, data) {
	var user = data.user.username;
	var rank = data.user.role;
	//if the user has name in the bot.devs array, or their role is one from bot.rank
	if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
		//checks to make sure there's params set
		if (typeof (data.params) !== "undefined" && data.params.length > 0) {
			//makes sure that there's more than one param (as motd can have two params, as well as the motd)
			if (data.params.length > 1) {
				var firstParam = data.params[0];
				//checks to see if the first param is a number, and doesn't return NaN
				var motd;
				if (isNaN(parseInt(firstParam))) {
					//checks to see if the first param is equal to set, if it is, remove it from the param list with slice, then join
					// the rest to set the motd
					if (firstParam === "set") {
						motd = data.params.slice(1).join(" ");
						bot.db.models.settings.findOne({
							id: "s3tt1ng5"
						}, function (err, doc) {
							if (err) {
								bot.log("error", "BOT", err);
							}
							doc.motd.enabled = true;
							doc.motd.msg = motd;
							doc.save();
							bot.sendChat("MOTD has been set to: " + motd);
						});
						//if it doesn't join the params together to set the motd
					} else {
						motd = data.params.join(" ");
						bot.db.models.settings.findOne({
							id: "s3tt1ng5"
						}, function (err, doc) {
							if (err) {
								bot.log("error", "BOT", err);
							}
							doc.motd.enabled = true;
							doc.motd.msg = motd;
							doc.save();
							bot.sendChat("MOTD has been set to: " + motd);
						});
					}
					//if the first param is a number
				} else {
					var secondParam = data.params[1];
					//checks to see if the second param is equal to set, it is, remove it and the interval from the param list with slice, then join
					//then join together to set the motd
					if (secondParam === "set") {
						motd = data.params.slice(2).join(" ");
						bot.db.motd.findOne({
							_id: 1
						}, function (err, doc) {
							doc.motd.enabled = true;
							doc.motd.interval = parseInt(firstParam);
							doc.motd.msg = motd;
							doc.save();
							bot.sendChat("MOTD has been set to: '" + motd + "' with interval of: " + parseInt(firstParam) + " songs");
						});
						//if it doesn't, just remove the interval from the params, then join them together to set the motd
					} else {
						motd = data.params.slice(1).join(" ");
						bot.db.models.settings.findOne({
							id: "s3tt1ng5"
						}, function (err, doc) {
							if (err) {
								bot.log("error", "BOT", err);
							}
							doc.motd.enabled = true;
							doc.motd.interval = parseInt(firstParam);
							doc.motd.msg = motd;
							doc.save();
							bot.sendChat("MOTD has been set to: '" + motd + "' with interval of: " + parseInt(firstParam) + " songs");
						});
					}
				}
				//if the params is one
			} else {
				//checks to see if the only param is set
				if (data.params[0] === "set") {
					bot.sendChat("to set MOTD do: !motd [interval] set [motd message]");
					//checks to se if the only param is interval, to see the current interval set
				} else if (data.params[0] === "interval") {
					bot.db.models.settings.findOne({
						id: "s3tt1ng5"
					}, function (err, doc) {
						if (err) {
							bot.log("error", "BOT", err);
						}
						bot.sendChat("MOTD interval is currently set to: " + doc.motd.interval + " songs");
					});
					//checks to see if the only param is a number	
				} else if (!isNaN(parseInt(data.params[0]))) {
					var interval = parseInt(data.params[0]);
					bot.db.models.settings.findOne({
						id: "s3tt1ng5"
					}, function (err, doc) {
						if (err) {
							bot.log("error", "BOT", err);
						}
						doc.motd.interval = interval;
						doc.save();
						bot.sendChat("MOTD interval changed to " + interval + " songs");
					});
					//checks to see if the only param is clear, to remove the MOTD
				} else if (data.params[0] === "clear") {
					bot.db.models.settings.findOne({
						id: "s3tt1ng5"
					}, function (err, doc) {
						if (err) {
							bot.log("error", "BOT", err);
						}
						doc.motd.enabled = false;
						doc.motd.msg = "";
						doc.save();
						bot.sendChat("MOTD cleared");
					});
				} else {
					//single word motd (for that odd occasion when we might have just one word. who knows)
					motd = data.params[0];
					bot.db.models.settings.findOne({
						id: "s3tt1ng5"
					}, function (err, doc) {
						if (err) {
							bot.log("error", "BOT", err);
						}
						doc.motd.msg = motd;
						doc.save();
						bot.sendChat("MOTD has been set to: " + motd);
					});
				}
			}
			//if the command is on its lonesome
		} else {
			bot.db.models.settings.findOne({
				id: "s3tt1ng5"
			}, function (err, doc) {
				if (err) {
					bot.log("error", "BOT", err);
				}
				if (doc.motd.msg === "") {
					bot.sendChat("Motd not set. do '!motd [interval] set [motd message]' to set motd");
				} else {
					bot.sendChat(doc.motd.msg);
				}
			});
		}
	}
};
