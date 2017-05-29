const request = require("request");
const moment = require("moment");
const event = require('./events/chat-message.js');

let xappToken;
let tokenExpiry;

function updateToken(bot, cb) {
	if (tokenExpiry != null) {
		if (moment().isBefore(tokenExpiry)) {
			cb();
			return;
		}
	}

	bot.log("info", "ART", "Loading art...");
	xappToken = null;
	tokenExpiry = null;

	const config = require(`${process.cwd()}/config`);
	request({
		url: "https://api.artsy.net/api/tokens/xapp_token",
		qs: {
			client_id: config.artsy.clientID,
			client_secret: config.artsy.clientSecret,
		},
		method: "POST",
		json: true,
	}, (error, response, body) => {
		if (error != null || response.statusCode !== 201) {
			bot.log("error", "ART_TOKEN_RETRIEVE", [response.statusCode, error, body]);
			// bot.sendChat("Art command could not load.");
			return;
		}

		xappToken = body.token;
		tokenExpiry = moment(body.expires_at);
		cb();
	});
}

function onCommand(bot, data) {
	if (xappToken == null) {
		bot.sendChat("This feature is currently unavailable. Try again later.");
		return;
	}

	updateToken(bot, () => {
		request({
			url: "https://api.artsy.net/api/artworks?sample",
			method: "GET",
			json: true,
			headers: { "X-Xapp-Token": xappToken },
		}, (error, response, body) => {
			/* eslint no-underscore-dangle: "off" */

			if (error != null || response.statusCode !== 200) {
				bot.log("error", "ART_REQUEST_COMMAND", [error, body]);
				bot.sendChat("Art could not be retrieved.");
				return;
			}

			let imgURL = body._links.image.href;
			if (body._links.image.templated === true) {
				imgURL = imgURL.replace("{image_version}", body.image_versions[0]);
			}

			bot.sendChat(`@${data.user.username}: "${body.title}" ${imgURL}`);
		});
	});
}

module.exports.init = bot => {
	updateToken(bot, () => {
		bot.log("info", "ART", "Art loaded successfully");
	});

	// Add the command handler
	event.AddCommand('art', onCommand);
};

// 	request({
// 	    url: "https://api.artsy.net/api/tokens/xapp_token",
// 	    headers: {
// 	        "X-Xapp-Token": xappToken,
// 	        "Accept": "application/vnd.artsy-v2+json"
// 	    }
// 	})
// };
