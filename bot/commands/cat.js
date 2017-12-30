const request = require("request");

module.exports = (bot, data) => {
	request({
		url: 'http://thecatapi.com/api/images/get',
		followRedirect: false,
		}, (error, response, body) => {

			if (error) {
				bot.log("error", "CAT_GET", [response.statusCode, error, body]);
				return;
			}

			let url = response.headers.location;
			bot.sendChat(`@${data.user.username}
				${url}`
			);
	});
};