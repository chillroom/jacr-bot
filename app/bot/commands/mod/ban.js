module.exports = function (bot, data) {
	var user = data.user.username;
	var rank = data.user.role;
	if (bot.devs.indexOf(user) > -1 || bot.ranks.indexOf(rank) > -1) {
		if (typeof (data.params) !== "undefined" && data.params.length > 0) {
			var username = data.params[0];
			var time = 60,
				person;
			if (data.params.length > 1) {
				var secondParam = data.params[1];
				if (username.substr(0, 1) === "@") {
					//remove the @
					username = username.substr(1);
				}
				if (!isNaN(parseInt(secondParam))) {
					time = parseInt(secondParam);
				}
				person = bot.getUserByName(username);
				if (bot.isVIP(person)) {
					bot.moderateUnsetRole(person.id, person.role);
				}
				setTimeout(function () {
					if (bot.ranks.indexOf(person.role) === -1) {
						bot.db.models.person.findOne({
							username: user
						}, function (err, banner) {
							if (err) {
								bot.log("error", "BOT", err);
							} else {
								banner.rank.banCount++;
								banner.save(function () {
									bot.db.models.person.findOne({
										uid: person.id
									}, function (err, ban) {
										if (err) {
											bot.log("error", "BOT", err);
										} else {
											if (!ban) {
												var doc = {
													username: username,
													uid: person.id
												};
												ban = new bot.db.models.person(doc);
											}
											ban.ban.lastBan = new Date();
											ban.ban.count++;
											ban.ban.by = banner.username;
											ban.save(function () {
												bot.db.models.ban.create({
													_person: ban._id
												});
											});
											bot.moderateBanUser(person.id, time);
										}
									});
								});
							}
						});
					}
				}, 1000);
			} else {
				if (username.substr(0, 1) === "@") {
					//remove the @
					username = username.substr(1);
				}
				person = bot.getUserByName(username);
				if (bot.isVIP(person)) {
					bot.moderateUnsetRole(person.id, person.role);
				}
				setTimeout(function () {
					if (bot.ranks.indexOf(person.role) === -1) {
						bot.db.models.person.findOne({
							username: user
						}, function (err, banner) {
							if (err) {
								bot.log("error", "BOT", err);
							} else {
								banner.rank.banCount++;
								banner.save(function () {
									bot.db.models.person.findOne({
										uid: person.id
									}, function (err, ban) {
										if (err) {
											bot.log("error", "BOT", err);
										} else {
											if (!ban) {
												var doc = {
													username: username,
													uid: person.id
												};
												ban = new bot.db.models.person(doc);
											}
											ban.ban.lastBan = new Date();
											ban.ban.count++;
											ban.ban.by = banner.username;
											ban.save(function () {
												bot.db.models.ban.create({
													_person: ban._id
												});
											});
											bot.moderateBanUser(person.id, time);
										}
									});
								});
							}
						});
					}
				}, 1000);
			}
		}
	}
};
