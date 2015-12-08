var request = require("request");

module.exports = function (bot) {
	var media = bot.getMedia();
	var id = "";
	if (media.type === "youtube") {
		id = media.fkid;
		bot.sendChat(bot.identifier + "https://youtu.be/" + id);
	} else if (media.type === "soundcloud") {
		id = media.fkid;
		request("http://api.soundcloud.com/tracks/" + id + "?client_id=***REMOVED***", function (error, response, body) {
			if (!error && response.statusCode === 200) {
				body = JSON.parse(body);
				bot.sendChat(bot.identifier + body.permalink_url);
			} else {
				bot.sendChat(bot.identifier + "something went wrong with the soundcloud API");
			}
		});
	}
};
