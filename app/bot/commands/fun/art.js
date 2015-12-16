var request = require("request");

var xappToken = "JvTPWe4WsQO-xqX6Bts49gSRBYDJShSsEEUDXhn7hzu4JghO4G19QYHA4qH_qG-wbwZcPYyz-8SMkw70m3uYcLMzPwBiXxxC8hYR2F17tRWwCokv8lJndDzGgI-mUY5VF-PQZPBHK0PL1i-Fx-7CJOjlfGfDRnq9CeXw81hfZfuyQ_gPK-PxeN4O-VU-nUog7Yf6mBVGm0NV96vwxv9nYPdORMRzO4hD7xVFULDQv4g=";


module.exports = function (bot, data) {
	if (typeof (data.params) !== "undefined" && data.params.length > 0) {
		if (data.params.length === 0) {
			bot.sendChat(bot.identifier + "please try !art [artist name] or !art search [artwork name/artist name]");
		} else {
			if (data.params[0] === "search") {
				query = data.params.slice(1).join(" ");
				query = encodeURIComponent(query);
				request({
					url: "https://api.artsy.net/api/v1/match/suggest?visible_to_public=true&fair_id=&size=7&term=" + query,
					headers: {
						"X-Xapp-Token": xappToken,
						"Accept": "application/vnd.artsy-v2+json"
					}
				}, function (error, response, body) {
					if (error) {
						bot.sendChat(bot.identifier + "sorry something went wrong");
						bot.log("error", "BOT", error);
					} else {
						if (response.statusCode === 200) {
							body = JSON.parse(body);
							if (typeof (body[0]) !== "undefined") {
								var artID = body[0].id;
								if (body[0].model = "artwork") {
									request({
										url: "https://fusion.artsy.net/api/v1/artwork/" + artID,
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
												var title = body.title;
												var artist = body.artist.name;
												var date = body.date;
												var image = body.images[0].image_urls.larger;
												if (image === "") {
													image = body.images[0].image_urls.large;
													if (image === "") {
														bot.sendChat(bot.identifier + "sorry, no image found for: ");
														bot.sendChat(bot.identifier + "Artist: " + artist);
														bot.sendChat(bot.identifier + "Title: " + title);
														bot.sendChat(bot.identifier + "Dated: " + date);
													} else {
														bot.sendChat(image);
														bot.sendChat(bot.identifier + "Artist: " + artist);
														bot.sendChat(bot.identifier + "Title: " + title);
														bot.sendChat(bot.identifier + "Dated: " + date);
													}
												} else {
													bot.sendChat(image);
													bot.sendChat(bot.identifier + "Artist: " + artist);
													bot.sendChat(bot.identifier + "Title: " + title);
													bot.sendChat(bot.identifier + "Dated: " + date);
												}

											} else if (response.statusCode === 401) {
												bot.sendChat(bot.identifier + "@nitroghost needs to hack this API in order for it to work again");
											} else {
												bot.sendChat(bot.identifier + "sorry unable to find anything");
											}
										}
									});
								} else if (body[0].model = "artist") {
									request({
										url: "https://api.artsy.net/api/v1/filter/artworks?artist_id=" + artID,
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
												if (typeof (art) == "undefined") {
													bot.sendChat(bot.identifier + "could not load artists images, please try again");
												} else {
													var title = art.title;
													var date = art.date;
													var image = art.images[0].image_urls.larger;
													if (image === "") {
														image = art.images[0].image_urls.large;
														if (image === "") {
															bot.sendChat(bot.identifier + "sorry, no image found for: ");
															bot.sendChat(bot.identifier + "Artist: " + artist);
															bot.sendChat(bot.identifier + "Title: " + title);
															bot.sendChat(bot.identifier + "Dated: " + date);
														} else {
															bot.sendChat(image);
															bot.sendChat(bot.identifier + "Artist: " + artist);
															bot.sendChat(bot.identifier + "Title: " + title);
															bot.sendChat(bot.identifier + "Dated: " + date);
														}
													} else {
														bot.sendChat(image);
														bot.sendChat(bot.identifier + "Artist: " + artist);
														bot.sendChat(bot.identifier + "Title: " + title);
														bot.sendChat(bot.identifier + "Dated: " + date);
													}
												}
											} else if (response.statusCode == 401) {
												bot.sendChat(bot.identifier + "@nitroghost needs to hack this API in order for it to work again");
											} else if (response.statusCode == 404) {
												bot.sendChat(bot.identifier + "sorry no artist found");
											} else {
												bot.sendChat(bot.identifier + "something went wrong");
											}
										}
									});
								} else {
									bot.sendChat(bot.identifier + "sorry no artist or artwork found, please try to be more specific. example: flowers 1964");
								}
							} else {
								bot.sendChat(bot.identifier + "sorry no artist or artwork found. most likely a spelling error");
							}
						} else if (response.statusCode === 401) {
							bot.sendChat(bot.identifier + "@nitroghost needs to hack this API in order for it to work again");
						} else {
							bot.sendChat(bot.identifier + "sorry unable to find anything");
						}
					}
				});
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
							if (typeof (art) !== "undefined") {
								bot.sendChat(bot.identifier + "could not load artists images, please try again");
							} else {
								var title = art.title;
								var date = art.date;
								var image = art.images[0].image_urls.larger;
								if (image === "") {
									image = art.images[0].image_urls.large;
									if (image === "") {
										bot.sendChat(bot.identifier + "sorry, no image found for: ");
										bot.sendChat(bot.identifier + "Titled: " + title);
										bot.sendChat(bot.identifier + "Dated: " + date);
									} else {
										bot.sendChat(image);
										bot.sendChat(bot.identifier + "Titled: " + title);
										bot.sendChat(bot.identifier + "Dated: " + date);
									}
								} else {
									bot.sendChat(image);
									bot.sendChat(bot.identifier + "Titled: " + title);
									bot.sendChat(bot.identifier + "Dated: " + date);
								}
							}
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
	}
};
