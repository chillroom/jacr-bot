const request = require("request");

module.exports = (bot, data) => {
	request({
		url: "https://www.reddit.com/r/highqualitygifs/random.json",
		json: true,
	}, (error, response, body) => {
		if (error != null || response.statusCode !== 200) {
			bot.log("error", "HQG_GET", [response.statusCode, error, body]);
			return;
		}

		const rData = body[0].data.children[0].data;

		if (rData.over_18) {
			module.exports(bot, data);
			return;
		}

		let url = rData.url;
		if (url.slice(-5) === ".gifv") {
			url = url.slice(0, -1);
		}

		bot.sendChat(`${data.user.username}: "${rData.title}" ${url}`);
	});
};
