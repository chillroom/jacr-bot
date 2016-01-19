var request = require("request");

module.exports = function (bot, data) {
	var user = data.user.username;
	if (typeof (data.params) !== "undefined" && data.params.length > 0) {
		var term;
		if (data.params.length === 1) {
			term = data.params[0];
			request("http://api.urbandictionary.com/v0/define?term=" + encodeURIComponent(term), function (error, response, body) {
				if (error) {
					bot.log("error", "BOT", error);
					bot.sendChat(bot.identifier + "something went wrong with the urban dictionary API");
				} else {
					body = JSON.parse(body);
					if (body.result_type !== "no_results") {
						var defid = body.list[0].defid;
						var definition = body.list[0].definition;
						request.get({
							url: "https://api.plugable.info/image?ext=jpg&url=" + encodeURIComponent("http://www.urbandictionary.com/render_definition.php?defid=" + defid)
						}, function (error, request, body) {
							if (error) {
								bot.log("error", "API", error);
							} else {
								if (request.statusCode === 200) {
									body = JSON.parse(body);
									bot.sendChat(bot.identifier + "http://urbandictionary.com/define.php?term=" + term);
									bot.sendChat(bot.identifier + body.data.image);
								} else if (request.statusCode === 201) {
									body = JSON.parse(body);
									bot.sendChat(bot.identifier + "http://urbandictionary.com/define.php?term=" + term);
									bot.sendChat(bot.identifier + body.data.image);
								} else {
									var slicer = 255 - (term.length + " definition: ".length);
									if (definition.length <= (510 - slicer)) {
										bot.sendChat(bot.identifier + "http://urbandictionary.com/define.php?term=" + term);
										bot.sendChat(bot.identifier + term + " definition: " + definition);

									} else {
										bot.sendChat(bot.identifier + "http://urbandictionary.com/define.php?term=" + term);
										bot.sendChat(bot.identifier + " sorry the definition for " + term + " is too long to be shown");
									}
								}
							}
						});
					} else {
						bot.sendChat(bot.identifier + "could not find the definition for: " + term);
					}
				}
			});
		} else {
			term = data.params.join(" ");
			request("http://api.urbandictionary.com/v0/define?term=" + encodeURIComponent(term), function (error, response, body) {
				if (error) {
					bot.log("error", "BOT", error);
					bot.sendChat(bot.identifier + "something went wrong with the urban dictionary API");
				} else {
					body = JSON.parse(body);
					if (body.result_type !== "no_results") {
						var defid = body.list[0].defid;
						var definition = body.list[0].definition;
						request.get({
							url: "https://api.plugable.info/image?ext=jpg&url=" + encodeURIComponent("http://www.urbandictionary.com/render_definition.php?defid=" + defid)
						}, function (error, request, body) {
							if (error) {
								bot.log("error", "API", error);
							} else {
								if (request.statusCode === 200) {
									body = JSON.parse(body);
									bot.sendChat(bot.identifier + "http://urbandictionary.com/define.php?term=" + encodeURIComponent(term));
									bot.sendChat(bot.identifier + body.data.image);
								} else if (request.statusCode === 201) {
									body = JSON.parse(body);
									bot.sendChat(bot.identifier + "http://urbandictionary.com/define.php?term=" + encodeURIComponent(term));
									bot.sendChat(bot.identifier + body.data.image);
								} else {
									var slicer = 255 - (term.length + " definition: ".length);
									if (definition.length <= (510 - slicer)) {
										bot.sendChat(bot.identifier + "http://urbandictionary.com/define.php?term=" + encodeURIComponent(term));
										bot.sendChat(bot.identifier + term + " definition: " + definition);

									} else {
										bot.sendChat(bot.identifier + "http://urbandictionary.com/define.php?term=" + encodeURIComponent(term));
										bot.sendChat(bot.identifier + " sorry the definition for " + term + " is too long to be shown");
									}
								}
							}
						});
					} else {
						bot.sendChat(bot.identifier + "could not find the definition for: " + data.params.join(" "));
					}
				}
			});
		}
	} else {
		bot.sendChat(bot.identifier + "@" + user + " you forgot to ask a word/phrase to define");
	}
};
