const request = require("request");

module.exports = (bot, data) => {
	request({
		url: 'http://thecatapi.com/api/images/get',
		followRedirect: false,
		}, (error, response, body) => {

			if (!error){
				bot.sendChat(response.headers.location);
			}
	});
};