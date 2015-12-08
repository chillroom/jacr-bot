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
				// timeout required else bot tries to ban before the vip has been demoted
				// it might be able to be a bit faster, 100ms was too quick
				setTimeout(function () {
					bot.moderateBanUser(person.id, time);
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
					bot.moderateBanUser(person.id, time);
				}, 1000);
			}
		}
	}
};
