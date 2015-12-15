var request = require("request");

var xappToken = "JvTPWe4WsQO-xqX6Bts49gSRBYDJShSsEEUDXhn7hzu4JghO4G19QYHA4qH_qG-wbwZcPYyz-8SMkw70m3uYcLMzPwBiXxxC8hYR2F17tRWwCokv8lJndDzGgI-mUY5VF-PQZPBHK0PL1i-Fx-7CJOjlfGfDRnq9CeXw81hfZfuyQ_gPK-PxeN4O-VU-nUog7Yf6mBVGm0NV96vwxv9nYPdORMRzO4hD7xVFULDQv4g=";


module.exports = function (bot, data) {
	if (typeof (data.params) !== "undefined" && data.params.length > 0) {
		if (data.params.length === 1) {
			bot.sendChat(bot.identifier + "no artist asked");
		} else {
			var artist = data.params.join("-").toLocaleLowerCase();
			request({
				url: "https://api.artsy.net/api/v1/filter/artworks?artist_id=" + artist,
				headers: {
					"X-Xapp-Token": xappToken,
					"Accept": "application/vnd.artsy-v2+json"
				}
			}, function (error, response, body) {
				if (error) {
					bot.log("error", "BOT", error);
					bot.sendChat(bot.identifier + "something went wrong");
				} else {
					if (response.statusCode === 200) {
						body = JSON.parse(body);
						var hits = body.hits;
						var art = hits[Math.floor(Math.random() * hits.length)];
						var title = art.title;
						var date = art.date;
						var image = art.images[0].image_urls.larger;
						bot.sendChat(image);
						bot.sendChat(bot.identifier + "Titled: " + title);
						bot.sendChat(bot.identifier + "Dated: " + date);
					} else if (response.statusCode == 401) {
						bot.sendChat("@nitroghost needs to hack this API in order for it to work again");
					} else if (response.statusCode == 404) {
						bot.sendChat(bot.identifier + "sorry no artist found");
					} else {
						bot.sendChat(bot.identifier + "something went wrong");
					}
				}
			});
		}
	}
};
