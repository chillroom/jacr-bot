var request = require("request");

module.exports = function (bot, data) {
	var user = data.user.username;
	if (typeof (data.params) !== "undefined" && data.params.length > 0) {
		var term;
		if (data.params.length === 1) {
			term = data.params[0];
			request("http://api.urbandictionary.com/v0/define?term=" + term, function (error, response, body) {
				if (error) {
					bot.log("error", "BOT", error);
					bot.sendChat("something went wrong with the urban dictionary API");
				} else {
					body = JSON.parse(body);
					if (body.result_type !== "no_results") {
						var definition = body.list[0].definition;
						var slicer = 255 - (term.length + " definition: ".length);
						if (definition.length <= (510 - slicer)) {
							bot.sendChat("http://urbandictionary.com/define.php?term=" + term);
							bot.sendChat(term + " definition: " + definition);

						} else {
							bot.sendChat("http://urbandictionary.com/define.php?term=" + term);
							bot.sendChat(" sorry the definition for " + term + " is too long to be shown");
						}
					} else {
						bot.sendChat("could not find the definition for: " + term);
					}
				}
			});
		} else {
			term = data.params.join("+");
			request("http://api.urbandictionary.com/v0/define?term=" + term, function (error, response, body) {
				if (error) {
					bot.log("error", "BOT", error);
					bot.sendChat("something went wrong with the urban dictionary API");
				} else {
					body = JSON.parse(body);
					if (body.result_type !== "no_results") {
						var definition = body.list[0].definition;
						var slicer = 255 - (term.length + " definition: ".length);
						if (definition.length <= (510 - slicer)) {
							bot.sendChat("http://urbandictionary.com/define.php?term=" + term);
							bot.sendChat(data.params.join(" ") + " definition: " + definition); // cause none wants dat +

						} else {
							bot.sendChat("http://urbandictionary.com/define.php?term=" + term);
							bot.sendChat(" sorry the definition for " + data.params.join(" ") + " is too long to be shown"); // oh should be here too.
						}
					} else {
						bot.sendChat("could not find definition for: " + data.params.join(" "));
					}
				}
			});
		}
	} else {
		bot.sendChat("@" + user + " you forgot to ask a word/phrase to define");
	}
};
