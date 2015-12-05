var request = require("request"),
	Select = require("soupselect").select,
	HtmlParser = require("htmlparser"),
	log = require("jethro");

module.exports = {
	//string bot responses
	ping: "pong!",
	pong: "ping!",
	commands: "List of commands : https://docs.google.com/document/d/1f2TH5SJRh42bN_1r52YtmyO3xJI6Tn_PQLzh38Q0k08/",
	dubx: "DubX : https://dubx.net/",
	theme: "Theme : http://just-a-chill-room.net/rules/#theme",
	op: "OP list : http://just-a-chill-room.net/op-forbidden-list/",
	emoji: "Emoji list : http://www.emoji-cheat-sheet.com/",
	rules: "Rules : http://just-a-chill-room.net/rules/",
	website: "Website : http://just-a-chill-room.net/",
	facebook: "Facebook : https://www.facebook.com/justachillroom",
	fb: "Facebook : https://www.facebook.com/justachillroom",
	twitter: "Twitter : https://twitter.com/justachillroom",
	youtube: "Youtube : https://goo.gl/qTX1aA",
	yt: "Youtube : https://goo.gl/qTX1aA",
	soundcloud: "Soundcloud : https://soundcloud.com/just-a-chill-room",
	sc: "Soundcloud : https://soundcloud.com/just-a-chill-room",
	steam: "Steam : http://steamcommunity.com/groups/JACR",
	slack: "Slack group: http://just-a-chill-room.net/join-slack/",
	mod: "Dubtrack Moderation : http://just-a-chill-room.net/about/dubtrack-moderation/",
	dj: "DJ Guide : http://just-a-chill-room.net/about/successful-dj-guide/",
	help: "Help : http://just-a-chill-room.net/dubtrack-fm-tips/",
	request: "Requesting a command :  https://bitbucket.org/dubbot/betabot/issues?status=new&status=open",
	requests: "Requesting a command :  https://bitbucket.org/dubbot/betabot/issues?status=new&status=open",
	suggest: "Suggesting a command :  https://bitbucket.org/dubbot/betabot/issues?status=new&status=open",
	suggestion: "Suggesting a command :  https://bitbucket.org/dubbot/betabot/issues?status=new&status=open",
	dank: ":maple_leaf: :smoking: blaze it",
	faq: "FAQ : http://just-a-chill-room.net/faq/",
	happypants: "What an idiot!",
	salty: "That's @tigerpancake",
	events: "Events : http://just-a-chill-room.net/events/",
	opadd: "Submit OP songs here : https://docs.google.com/forms/d/1G0qcIG5Sz3BjL20nIas-LoxJb8yhY-z867PHMRPs2rs/viewform?c=0&w=1",
	opsub: "Submit OP songs here : https://docs.google.com/forms/d/1G0qcIG5Sz3BjL20nIas-LoxJb8yhY-z867PHMRPs2rs/viewform?c=0&w=1",
	shrug: "¯\\_(ツ)_/¯",
	//because purn doesn't want the self.identifier to send when images, all image resonses go here
	//self.identifier is omitted from self.sendChat
	chill: function (data) {
		var self = this;
		var memes = [
			"http://i.imgur.com/7IDkIw8.jpg",
			"http://imgur.com/3IuSnRg.gif"
		];
		var post = memes[Math.floor(Math.random() * memes.length)];
		self.sendChat(post);
	},
	blazeit: function (data) {
		var self = this;
		var memes = [
			"http://i.imgur.com/y7Pa6A5.jpg",
			"http://i.imgur.com/N9RyuI0.jpg"
		];
		var post = memes[Math.floor(Math.random() * memes.length)];
		self.sendChat(post);
	},
	purn: function (data) {
		var self = this;
		var memes = [
			"http://puu.sh/lrdTh/a7e4a53a2d.jpg",
			"http://puu.sh/lrdTh/a7e4a53a2d.jpg"
		];
		var post = memes[Math.floor(Math.random() * memes.length)];
		self.sendChat(post);
	},
	jinkx: function (data) {
		var self = this;
		self.sendChat("http://puu.sh/lHI7X/5cd15acbaa.jpg");
	},
	haha: function (data) {
		var self = this;
		self.sendChat("http://38.media.tumblr.com/938f2bc336c9b589955cd783ef3a55e6/tumblr_nn2j3ncrd21qm3rsfo2_400.gif");
	},
	yogapants: function (data) {
		var self = this;
		var memes = [
			"http://fistfuloftalent.com/wp-content/uploads/2015/05/no-thank-you-gif.gif",
			"http://media.tumblr.com/0a967a7fdb105de3cbe5266fa084fdb7/tumblr_inline_mtql5epdaQ1qznfri.gif",
			"http://assets0.ordienetworks.com/images/GifGuide/michael_scott/The-Office-gifs-the-office-14948948-240-196.gif"
		];
		var post = memes[Math.floor(Math.random() * memes.length)];
		self.sendChat(post);
	},
	no: function (data) {
		var self = this;
		var memes = [
			"http://fistfuloftalent.com/wp-content/uploads/2015/05/no-thank-you-gif.gif",
			"http://media.tumblr.com/0a967a7fdb105de3cbe5266fa084fdb7/tumblr_inline_mtql5epdaQ1qznfri.gif",
			"http://assets0.ordienetworks.com/images/GifGuide/michael_scott/The-Office-gifs-the-office-14948948-240-196.gif"
		];
		var post = memes[Math.floor(Math.random() * memes.length)];
		self.sendChat(post);
	},
	bunneh: function (data) {
		var self = this;
		var bunnehs = [
			"http://cdn.earthporm.com/wp-content/uploads/2014/07/cute-bunnies-tongues-6.jpg",
			"http://viralpirate.com/wp-content/uploads/2015/09/Happy_bunny_Wallpaper_btzqo.jpg",
			"http://i.imgur.com/5nGWQWK.jpg",
			"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Wild_rabbit_us.jpg/1280px-Wild_rabbit_us.jpg"
		];
		var bunneh = bunnehs[Math.floor(Math.random() * bunnehs.length)];
		self.sendChat(bunneh);
	},
	twerk: function (data) {
		var self = this;
		var twerks = [
			"http://www.pride.com/sites/pride.com/files/dance.gif"
		];
		var twerk = twerks[Math.floor(Math.random() * twerks.length)];
		self.sendChat(twerk);
	},
	simps: function (data) {
		var self = this;
		var simpses = [
			"http://media0.giphy.com/media/jUwpNzg9IcyrK/giphy.gif",
			"http://asset-2.soupcdn.com/asset/13974/2268_2f97.gif"
		];
		var simps = simpses[Math.floor(Math.random() * simpses.length)];
		self.sendChat(simps);
	},
	pizza: function (data) {
		var self = this;
		var pizzas = [
			"https://img.pandawhale.com/post-8630-Homer-Simpson-backs-into-peppe-o3R8.gif",
			"https://s-media-cache-ak0.pinimg.com/236x/2b/d5/ec/2bd5ec398f08334daea25dbed9b09bbc.jpg",
			"http://iruntheinternet.com/lulzdump/images/sounds-delicious-pizza-record-player-LP-vinyl-13583317950.jpg",
			"http://funguerilla.com/wp-content/uploads/2010/06/funny-pizza-images17-.jpg",
			"https://t3hwin.com/i/2014/12/Pizza-baby.jpg"
		];
		var pizza = pizzas[Math.floor(Math.random() * pizzas.length)];
		self.sendChat(pizza);
	},
	//function bot responses
	define: function (data) {
		var self = this;
		var user = data.user.username;
		if (typeof (data.params) !== "undefined" && data.params.length > 0) {
			var term;
			if (data.params.length === 1) {
				term = data.params[0];
				request("http://api.urbandictionary.com/v0/define?term=" + term, function (error, response, body) {
					body = JSON.parse(body);
					if (body.result_type !== "no_results") {
						var definition = body.list[0].definition;
						var slicer = 255 - (self.identifier.length + term.length + " definition: ".length);
						if (definition.length <= (510 - slicer)) {
							self.sendChat(self.identifier + "http://urbandictionary.com/define.php?term=" + term);
							self.sendChat(self.identifier + term + " definition: " + definition);

						} else {
							self.sendChat(self.identifier + "http://urbandictionary.com/define.php?term=" + term);
							self.sendChat(self.identifier + " sorry the definition for " + term + " is too long to be shown");
						}
					} else {
						self.sendChat(self.identifier + "something went wrong with the Urban Dictionary API");
					}
				});
			} else {
				term = data.params.join("+");
				request("http://api.urbandictionary.com/v0/define?term=" + term, function (error, response, body) {
					body = JSON.parse(body);
					if (body.result_type !== "no_results") {
						var definition = body.list[0].definition;
						var slicer = 255 - (self.identifier.length + term.length + " definition: ".length);
						if (definition.length <= (510 - slicer)) {
							self.sendChat(self.identifier + "http://urbandictionary.com/define.php?term=" + term);
							self.sendChat(self.identifier + data.params.join(" ") + " definition: " + definition); // cause none wants dat +

						} else {
							self.sendChat(self.identifier + "http://urbandictionary.com/define.php?term=" + term);
							self.sendChat(self.identifier + " sorry the definition for " + data.params.join(" ") + " is too long to be shown"); // oh should be here too.
						}
					} else {
						self.sendChat(self.identifier + "something went wrong with the Urban Dictionary API");
					}
				});
			}
		} else {
			self.sendChat(self.identifier + "@" + user + " you forgot to ask a word/phrase to define");
		}
	},
	sendlove: function (data) {
		var self = this;
		var user = data.user.username;
		if (typeof (data.params) !== "undefined" && data.params.length > 0) {
			if (data.params.length === 1) {
				if (data.params[0].substr(0, 1) === "@") {
					var recipient = data.params[0];
					self.sendChat(self.identifier + "@" + user + " just sent " + recipient + " love... What a worthless gift!");
				} else {
					self.sendChat(self.identifier + "@" + user + " you need to @[username] to send them love");
				}
			} else {
				self.sendChat(self.identifier + "@" + user + " you can only send a love to one person at a time you whore you");
			}
		} else {
			self.sendChat(self.identifier + "@" + user + " just sent me love. aww what a cutie");
		}
	},
	taco: function (data) {
		var self = this;
		var tacos = [
			"a spicy taco!",
			"a taco filled with questionable meat, I wouldn't touch that.!",
			"a scrumptious taco full of " +
			"meaty goodness, mmmm",
			"a taco full of rainbows and love!"
		];
		var taco = tacos[Math.floor(Math.random() * tacos.length)];
		var user = data.user.username;
		if (typeof (data.params) !== "undefined" && data.params.length > 0) {
			if (data.params.length === 1) {
				if (data.params[0].substr(0, 1) === "@") {
					var recipient = data.params[0];
					self.sendChat(self.identifier + "@" + user + " just sent " + recipient + " " + taco);
				} else {
					self.sendChat(self.identifier + "@" + user + " you need to @[username] to send them a taco");
				}
			} else {
				self.sendChat(self.identifier + "@" + user + " you can only send a taco to one person");
			}
		} else {
			self.sendChat(self.identifier + "@" + user + " you didn't select a user. You need to @[username] to send them a taco");
		}
	},
	cookie: function (data) {
		var self = this;
		var cookies = [
			"a chocolate chip cookie!",
			"a soft homemade oatmeal cookie!",
			"a plain, dry, old cookie. It was the last one in the bag. Gross.",
			"a sugar cookie. What, no frosting and sprinkles? 0/10 would not touch.",
			"a chocolate chip cookie. Oh wait, those are raisins. Bleck!",
			"an enormous cookie. Poking it gives you more cookies. Weird.",
			"a fortune cookie. It reads \"Why aren't you working on any projects?\"",
			"a fortune cookie. It reads \"Give that special someone a compliment\"",
			"a fortune cookie. It reads \"Take a risk!\"",
			"a fortune cookie. It reads \"Go outside.\"",
			"a fortune cookie. It reads \"Don't forget to eat your veggies!\"",
			"a fortune cookie. It reads \"Do you even lift?\"",
			"a fortune cookie. It reads \"m808 pls\"",
			"a fortune cookie. It reads \"If you move your hips, you'll get all the ladies.\"",
			"a fortune cookie. It reads \"I love you.\"",
			"a Golden Cookie. You can't eat it because it is made of gold. Dammit.",
			"an Oreo cookie with a glass of milk!",
			"a rainbow cookie made with love :heart:",
			"an old cookie that was left out in the rain, it's moldy.",
			"freshly baked cookies, they smell amazing."
		];
		var cookie = cookies[Math.floor(Math.random() * cookies.length)];
		var user = data.user.username;
		if (typeof (data.params) !== "undefined" && data.params.length > 0) {
			if (data.params.length === 1) {
				if (data.params[0].substr(0, 1) === "@") {
					var recipient = data.params[0];
					self.sendChat(self.identifier + "@" + user + " just sent " + recipient + " " + cookie);
				} else {
					self.sendChat(self.identifier + "@" + user + " you need to @[username] to send them a cookie");
				}
			} else {
				self.sendChat(self.identifier + "@" + user + " you can only send a cookie to one person");
			}
		} else {
			self.sendChat(self.identifier + "@" + user + " you didn't select a user. You need to @[username] to send them a cookie");
		}
	},
	spiritanimal: function (data) {
		var self = this;
		var animals = [
			"http://www.welikeviral.com/files/2014/12/Funniest-Animals-1.gif",
			"http://www.drodd.com/images10/funny-animal-gifs6.gif",
			"https://s-media-cache-ak0.pinimg.com/originals/bf/75/0b/bf750b997fdc50479b3e2bc22703a3fd.gif",
			"http://media.galaxant.com/000/112/302/funny-animal-003.gif",
			"https://terri0729.files.wordpress.com/2012/04/funny-animal-gifs-animal-gifs-retro-nuts.gif",
			"http://31.media.tumblr.com/tumblr_m953yqX9fp1rvp30m.gif",
			"http://data.whicdn.com/images/24421589/large.gif",
			"http://38.media.tumblr.com/1f98a3a7f611e901d1e6d6565c357484/tumblr_n1ypzdtyxy1sodo64o1_250.gif",
			"https://assets-animated.rbl.ms/454314/980x.gif",
			"http://s3.amazonaws.com/barkpost-assets/50+GIFs/15.gif",
			"http://mac.h-cdn.co/assets/cm/14/49/5482da9ba1cf4_-_mcx-13-animal-gifs-96121069.gif",
			"http://25.media.tumblr.com/f40b050fb4d6ab87a2d94dc7f27a72ef/tumblr_mwpjq4Tq2U1slwrsuo1_400.gif",
			"http://4.bp.blogspot.com/-Pp1tRFgB75U/VRFgn8Ir5GI/AAAAAAAAI2Q/BhjIByViBWM/s1600/dog.gif",
			"https://heavyeditorial.files.wordpress.com/2014/03/animals-staring-funny-gifs-41.gif",
			"https://s-media-cache-ak0.pinimg.com/originals/2b/b2/01/2bb20129e3eab0229a07fe5fd74ddb22.gif",
			"http://www.thinknice.com/wp-content/uploads/2013/08/Real-Angry-Bird-Animated-GIF.gif",
			"http://acidcow.com/pics/20130724/animal_gifs_01.gif",
			"http://38.media.tumblr.com/f786234818fb4224dabd4a46ee2495e0/tumblr_mun3l5afcf1shdotdo1_400.gif",
			"http://img.photobucket.com/albums/v296/eledhwenlin/cute/funny-animal-gifs-animal-gifs-let-s.gif",
			"http://data.whicdn.com/images/135594271/original.gif"
		];
		var animal = animals[Math.floor(Math.random() * animals.length)];
		self.sendChat(self.identifier + "Your spirit animal is a " + animal);
	},
	joke: function (data) {
		var self = this;
		var jokes = [
			"Why was Pavlov's hair so soft? Classical conditioning!",
			"Did you hear about the two lawyers who set up shop under the old oak tree? I heard it was a pretty shady business.",
			"How many tickles does it take to make an octopus giggle? Ten tickles!",
			"http://i.imgur.com/eesajrE.jpg", "http://i.imgur.com/G8kf7HS.jpg"
		];
		var joke = jokes[Math.floor(Math.random() * jokes.length)];
		self.sendChat(self.identifier + joke);
	},
	link: function (data) {
		var self = this;
		var media = self.getMedia();
		var id = "";
		if (media.type === "youtube") {
			id = media.fkid;
			self.sendChat(self.identifier + "https://youtu.be/" + id);
		} else if (media.type === "soundcloud") {
			id = media.fkid;
			request("http://api.soundcloud.com/tracks/" + id + "?client_id=***REMOVED***", function (error, response, body) {
				if (!error && response.statusCode === 200) {
					body = JSON.parse(body);
					self.sendChat(self.identifier + body.permalink_url);
				} else {
					self.sendChat(self.identifier + "something went wrong with the soundcloud API");
				}
			});
		}
	},
	dialect: function (data) {
		var self = this;
		var dialects = ["redneck", "jive", "cockney", "fudd", "bork", "moron", "piglatin", "hckr", "censor"];
		if (typeof (data.params) !== "undefined" && data.params.length > 0) {
			if (data.params.length === 1) {
				if (data.params[0] === ("help" || "h")) {
					self.sendChat(self.identifier + "dialects: " + dialects.join(", "));
				} else {
					self.sendChat(self.identifier + "to use do: !dialect [dialect] [message]");
				}
			} else {
				if (data.params[0] === ("hacker" || "hax" || "haxor")) {
					data.params[0] = "hckr";
				}
				if (dialects.indexOf(data.params[0]) > -1) {
					var dialect = data.params[0];
					var text = data.params.slice(1).join(" ").trim();
					request("http://www.rinkworks.com/dialect/dialectt.cgi?dialect=" + encodeURIComponent(dialect) + "&text=" + encodeURIComponent(text), function (error, response, body) {
						var handler = new HtmlParser.DefaultHandler();
						var parser = new HtmlParser.Parser(handler);
						parser.parseComplete(body);
						var result = Select(handler.dom, ".dialectized_text p");
						if (!result) {
							return;
						}
						var dialectizedText = result[0].children[0].raw;
						self.sendChat(self.identifier + dialectizedText.trim());
					});
				} else {
					self.sendChat(self.identifier + "to use do: !dialect [dialect] [message]");
				}
			}
		}
	},
	time: function (data) {
		var self = this;
		var user = data.user.username;
		if (typeof (data.params) !== "undefined" && data.params.length > 0) {
			if (data.params.length === 1 && data.params[0] === ("help" || "h")) {
				self.sendChat(self.identifier + "you can check the time of any town, city anywhere in the world by doing: !time [in | is it in | for] [location]. You may want to be specific with locations like: \"London, Canada\" for best results");
			} else {
				var text = data.params.join(" ");
				if (/(in|is it in|for) (.*)/i.test(text)) {
					var api_key = "***REMOVED***";
					var query = data.message.match(/(in|is it in|for) (.*)/i)[2];
					query = query.split(" ");
					query = query.join("+");
					request("http://api.worldweatheronline.com/free/v2/weather.ashx?key=" + api_key + "&q=" + query + "&format=json&showlocaltime=yes", function (error, response, body) {
						body = JSON.parse(body);
						if (typeof (body.data.error) === "undefined") {
							var location = body.data.request[0].query;
							var currentTime = body.data.time_zone[0].localtime.slice(11);
							self.sendChat(self.identifier + "@" + user + " current time in " + location + " is " + currentTime);
						} else {
							self.sendChat(self.identifier + "@" + user + " sorry, no location found");
						}
					});
				}
			}
		}
	},
	//MOD COMMANDS YO!
	motd: function (data) {
		var self = this;
		var user = data.user.username;
		var rank = data.user.role;
		//if the user has name in the self.devs array, or their role is one from self.rank
		if (self.devs.indexOf(user) > -1 || self.ranks.indexOf(rank) > -1) {
			//checks to make sure there's params set
			if (typeof (data.params) !== "undefined" && data.params.length > 0) {
				//makes sure that there's more than one param (as motd can have two params, as well as the motd)
				if (data.params.length > 1) {
					var firstParam = data.params[0];
					//checks to see if the first param is a number, and doesn't return NaN
					var motd;
					if (isNaN(parseInt(firstParam))) {
						//checks to see if the first param is equal to set, if it is, remove it from the param list with slice, then join
						// the rest to set the motd
						if (firstParam === "set") {
							motd = data.params.slice(1).join(" ");
							self.db.models.Settings.findOne({
								id: "s3tt1ng5"
							}, function (err, doc) {
								if (err) {
									log("error", "BOT", err);
								}
								doc.motd.enabled = true;
								doc.motd.msg = motd;
								doc.save();
								self.sendChat(self.identifier + "MOTD has been set to: " + motd);
							});
							//if it doesn't join the params together to set the motd
						} else {
							motd = data.params.join(" ");
							self.db.models.Settings.findOne({
								id: "s3tt1ng5"
							}, function (err, doc) {
								if (err) {
									log("error", "BOT", err);
								}
								doc.motd.enabled = true;
								doc.motd.msg = motd;
								doc.save();
								self.sendChat(self.identifier + "MOTD has been set to: " + motd);
							});
						}
						//if the first param is a number
					} else {
						var secondParam = data.params[1];
						//checks to see if the second param is equal to set, it is, remove it and the interval from the param list with slice, then join
						//then join together to set the motd
						if (secondParam === "set") {
							motd = data.params.slice(2).join(" ");
							self.db.motd.findOne({
								_id: 1
							}, function (err, doc) {
								doc.motd.enabled = true;
								doc.motd.interval = parseInt(firstParam);
								doc.motd.msg = motd;
								doc.save();
								self.sendChat(self.identifier + "MOTD has been set to: '" + motd + "' with interval of: " + parseInt(firstParam) + " songs");
							});
							//if it doesn't, just remove the interval from the params, then join them together to set the motd
						} else {
							motd = data.params.slice(1).join(" ");
							self.db.models.Settings.findOne({
								id: "s3tt1ng5"
							}, function (err, doc) {
								if (err) {
									log("error", "BOT", err);
								}
								doc.motd.enabled = true;
								doc.motd.interval = parseInt(firstParam);
								doc.motd.msg = motd;
								doc.save();
								self.sendChat(self.identifier + "MOTD has been set to: '" + motd + "' with interval of: " + parseInt(firstParam) + " songs");
							});
						}
					}
					//if the params is one
				} else {
					//checks to see if the only param is set
					if (data.params[0] === "set") {
						self.sendChat(self.identifier + "to set MOTD do: !motd [interval] set [motd message]");
						//checks to se if the only param is interval, to see the current interval set
					} else if (data.params[0] === "interval") {
						self.db.models.Settings.findOne({
							id: "s3tt1ng5"
						}, function (err, doc) {
							if (err) {
								log("error", "BOT", err);
							}
							self.sendChat(self.identifier + "MOTD interval is currently set to: " + doc.motd.interval + " songs");
						});
						//checks to see if the only param is a number	
					} else if (!isNaN(parseInt(data.params[0]))) {
						var interval = parseInt(data.params[0]);
						self.db.models.Settings.findOne({
							id: "s3tt1ng5"
						}, function (err, doc) {
							if (err) {
								log("error", "BOT", err);
							}
							doc.motd.interval = interval;
							doc.save();
							self.sendChat(self.identifier + "MOTD interval changed to " + interval + " songs");
						});
						//checks to see if the only param is clear, to remove the MOTD
					} else if (data.params[0] === "clear") {
						self.db.models.Settings.findOne({
							id: "s3tt1ng5"
						}, function (err, doc) {
							if (err) {
								log("error", "BOT", err);
							}
							doc.motd.enabled = false;
							doc.motd.msg = "";
							doc.save();
							self.sendChat(self.identifier + "MOTD cleared");
						});
					} else {
						//single word motd (for that odd occasion when we might have just one word. who knows)
						motd = data.params[0];
						self.db.models.Settings.findOne({
							id: "s3tt1ng5"
						}, function (err, doc) {
							if (err) {
								log("error", "BOT", err);
							}
							doc.motd.msg = motd;
							doc.save();
							self.sendChat(self.identifier + "MOTD has been set to: " + motd);
						});
					}
				}
				//if the command is on its lonesome
			} else {
				self.db.models.Settings.findOne({
					id: "s3tt1ng5"
				}, function (err, doc) {
					if (err) {
						log("error", "BOT", err);
					}
					if (doc.motd.msg === "") {
						self.sendChat(self.identifier + "Motd not set. do '!motd [interval] set [motd message]' to set motd");
					} else {
						self.sendChat(self.identifier + doc.motd.msg);
					}
				});
			}
		}
	},
	whois: function (data) {
		var self = this;
		var user = data.user.username;
		var rank = data.user.role;
		//if the user has name in the self.devs array, or their role is one from self.rank
		if (self.devs.indexOf(user) > -1 || self.ranks.indexOf(rank) > -1) {
			if (typeof (data.params) !== "undefined" && data.params.length > 0) {
				if (data.params.length === 1) {
					var username = data.params[0];
					if (username.substr(0, 1) === "@") {
						//remove the @
						username = username.substr(1);
					}
					try {
						var person = self.getUserByName(username);
						var kickcount = (typeof (person.kickCount) === "undefined") ? 0 : person.kickCount;
						self.sendChat(self.identifier + "Username : " + person.username + "\n" + self.identifier + " Played songs : " + person.playedCount + "\n" + self.identifier + " Songs in queue : " + person.songsInQueue + "\n" + self.identifier + " Dubs : " + person.dubs + "\n" + self.identifier + " Kick count : " + kickcount);
					} catch (e) {
						self.sendChat(self.identifier + "username is invalid.");
					}
				} else {
					self.sendChat(self.identifier + "Please enter a single username.");
				}

			}
		}
	},
	skip: function (data) {
		var self = this;
		var user = data.user.username;
		var rank = data.user.role;
		if (self.devs.indexOf(user) > -1 || self.vips.indexOf(rank) > -1) {
			if (typeof (data.params) !== "undefined") {
				var reset = function () {
					setTimeout(function () {
						self.protection = false;
					}, 2000);
				};
				if (data.params.length > 0) {
					if (!self.protection) {
						self.protection = true;
						self.moderateSkip(reset);
						switch (data.params[0]) {
						case "op":
							self.sendChat(self.identifier + "Song skipped for being op, check http://just-a-chill-room.net/op-forbidden-list/ next time please");
							break;
						case "history":
							self.sendChat(self.identifier + "Song was recently played, history can be viewed by clicking queue then room history.");
							break;
						case "hist":
							self.sendChat(self.identifier + "Song was recently played, history can be viewed by clicking queue then room history.");
							break;
						case "nsfw":
							self.sendChat(self.identifier + "Song skipped for being NSFW, too much NSFW = ban!");
							break;
						case "theme":
							self.sendChat(self.identifier + "Song does not fit the room theme.");
							break;
						case "forbidden":
							self.sendChat(self.identifier + "This song is on the forbidden list: http://just-a-chill-room.net/op-forbidden-list/ ");
							break;
						case "n/a":
							self.sendChat(self.identifier + "This song is not available to all users");
							break;
						default:
							self.sendChat(self.identifier + "Parameter not recognised, suggest it here: https://bitbucket.org/dubbot/dubbot/issues?status=new&status=open");
						}
					}

				} else {
					if (!self.protection) {
						self.protection = true;
						self.moderateSkip(reset);
						self.sendChat(self.identifier + "Song skipped, no reason given though");
						self.sendChat("!shrug");
					}
				}
			}
		}
	},
	//oh god, dis command is scary;
	clearchat: function (data) {
		var self = this;
		var user = data.user.username;
		var rank = data.user.role;
		if (self.devs.indexOf(user) > -1 || self.ranks.indexOf(rank) > -1) {
			if (typeof (data.params) !== "undefined" && data.params.length > 0) {
				if (data.params.length === 1) {
					var username = data.params[0];
					if (username.substr(0, 1) === "@") {
						username = username.substr(1);
					}
					self.db.models.Chat.find({
						username: username
					}).sort({
						time: -1
					}).limit(10).exec(function (err, docs) {
						if (err) {
							log("error", "BOT", err);
						} else {
							docs.forEach(function (doc) {
								self.moderateDeleteChat(doc.chatid);
								self.db.models.Chat.remove({
									chatid: doc.chatid
								}, function (err, doc) {
									if (err) {
										log("error", "BOT", err);
									}
								});
							});
						}
					});
				}
			}
		}
	},
	unset: function (data) {
		var self = this;
		var user = data.user.username;
		var rank = data.user.role;
		if (self.devs.indexOf(user) > -1 || self.ranks.indexOf(rank) > -1) {
			if (typeof (data.params) !== "undefined" && data.params.length > 0) {
				var username = data.params[0];
				if (username.substr(0, 1) === "@") {
					username = username.substr(1);
				}
				var person = self.getUserByName(username);
				if (self.isVIP(person)) {
					self.moderateUnsetRole(person.id, person.role);
				} else {
					self.sendChat("@" + user + " you can only unset VIPs");
				}
			}
		} else {
			self.sendChat("Please specify a user");
		}
	},
	set: function (data) {
		var self = this;
		var user = data.user.username;
		var rank = data.user.role;
		if (self.devs.indexOf(user) > -1 || self.ranks.indexOf(rank) > -1) {
			if (typeof (data.params) !== "undefined" && data.params.length > 0) {
				var username = data.params[0];
				if (username.substr(0, 1) === "@") {
					username = username.substr(1);
				}
				var person = self.getUserByName(username);
				if (!self.isVIP(person)) {
					self.moderateSetRole(person.id, "5615fe1ee596154fc2000001");
				} else {
					self.sendChat("@" + user + " that user is already a VIP");
				}
			}
		} else {
			self.sendChat("Please specify a user");
		}
	},
	ban: function (data) {
		var self = this;
		var user = data.user.username;
		var rank = data.user.role;
		if (self.devs.indexOf(user) > -1 || self.ranks.indexOf(rank) > -1) {
			if (typeof (data.params) !== "undefined" && data.params.length > 0) {
				var username = data.params[0];
				var time = 60,
					person;
				if (data.params.length > 1) {
					var secondParam = data.params[1];
					if (username.substr(0, 1) === "@") {
						//remove the @
						username = username.substr(1);
					}
					if (!isNaN(parseInt(secondParam))) {
						time = parseInt(secondParam);
					}
					person = self.getUserByName(username);
					if (self.isVIP(person)) {
						self.moderateUnsetRole(person.id, person.role);
					}
					// timeout required else bot tries to ban before the vip has been demoted
					// it might be able to be a bit faster, 100ms was too quick
					setTimeout(function () {
						self.moderateBanUser(person.id, time);
					}, 1000);
				} else {
					if (username.substr(0, 1) === "@") {
						//remove the @
						username = username.substr(1);
					}
					person = self.getUserByName(username);
					if (self.isVIP(person)) {
						self.moderateUnsetRole(person.id, person.role);
					}
					setTimeout(function () {
						self.moderateBanUser(person.id, time);
					}, 1000);
				}
			}
		}
	}
};
