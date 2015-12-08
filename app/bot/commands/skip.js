module.exports = function (bot, data) {
	var user = data.user.username;
	var rank = data.user.role;
	if (bot.devs.indexOf(user) > -1 || bot.vips.indexOf(rank) > -1) {
		if (typeof (data.params) !== "undefined") {
			var reset = function () {
				setTimeout(function () {
					bot.protection = false;
				}, 2000);
			};
			if (data.params.length > 0) {
				if (!bot.protection) {
					bot.protection = true;
					bot.moderateSkip(reset);
					switch (data.params[0]) {
					case "op":
						bot.sendChat("Song skipped for being op, check http://just-a-chill-room.net/op-forbidden-list/ next time please");
						break;
					case "history":
						bot.sendChat("Song was recently played, history can be viewed by clicking queue then room history.");
						break;
					case "hist":
						bot.sendChat("Song was recently played, history can be viewed by clicking queue then room history.");
						break;
					case "nsfw":
						bot.sendChat("Song skipped for being NSFW, too much NSFW = ban!");
						break;
					case "theme":
						bot.sendChat("Song does not fit the room theme.");
						break;
					case "forbidden":
						bot.sendChat("This song is on the forbidden list: http://just-a-chill-room.net/op-forbidden-list/ ");
						break;
					case "n/a":
						bot.sendChat("This song is not available to all users");
						break;
					default:
						bot.sendChat("Parameter not recognised, suggest it here: https://bitbucket.org/dubbot/dubbot/issues?status=new&status=open");
					}
				}

			} else {
				if (!bot.protection) {
					bot.protection = true;
					bot.moderateSkip(reset);
					bot.sendChat("Song skipped, no reason given though");
					bot.sendChat("!shrug");
				}
			}
		}
	}
};
