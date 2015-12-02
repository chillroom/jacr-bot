var DubAPI = require('dubapi'),
	mongoose = require('mongoose'),
	pkg = require('../package.json'),
	commands = require('./commands');

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO || "mongodb://betabot:MickieRocks123@linus.mongohq.com:10016/chill_bot", {
	server: {
		auto_reconnect: true
	}
});

new DubAPI({
	username: 'betabot',
	password: 'mickierocks'
}, function (err, bot) {
	if (err) {
		return console.error(err);
	}
	// purps array has now become bot.ranks array, so that it is easier to use within the commands
	bot.ranks = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001"];
	//if want to give vip perm, use this instead of ranks
	bot.vips = ["5615fa9ae596154a5c000000", "5615fd84e596150061000003", "52d1ce33c38a06510c000001", "5615fe1ee596154fc2000001"];
	bot.devs = ["tigerpancake", "mclovinthesex", "nitroghost"];
	//added protection to protect against double skips
	bot.protection = false;
	//added a bot identifier to the bot to be sent along with the bot responses. added it here so it's easy to change if needed
	//make sure to add a space at the end so we don't need to include it all the time like bot.idenifier + " " + "this text"
	bot.identifier = ":white_small_square: ";
	//added array of emojis to bot
	bot.emojis = require('./emojis');
	//added emoji reset to be used to reset the count back to 0 (only at the end of the week);
	bot.emojisReset = false;
	//added emoji pause to be used to stop double enteries in the days tracker
	bot.emojisPause = false;
	//added DB to bot
	bot.db = mongoose.connection;
	bot.db.on('error', function (err) {
		console.error('MongoDB connection error:', err);
	});

	bot.db.once('open', function callback() {
		console.info('MongoDB connection is established');
	});

	bot.db.on('disconnected', function () {
		console.error('MongoDB disconnected!');
		mongoose.connect(process.env.MONGO_URL || "mongodb://betabot:MickieRocks123@linus.mongohq.com:10016/chill_bot", {
			server: {
				auto_reconnect: true
			}
		});
	});

	bot.db.on('reconnected', function () {
		console.info('MongoDB reconnected!');
	});
	require('./models')(bot, mongoose);
	//function to send MOTD based off the number of songs played
	/*bot.sendMotd = function () {
		bot.db.motd.findOne({
			_id: 1
		}, function (err, doc) {
			doc = doc || {
				_id: 1,
				enabled: false,
				songCount: 0,
				interval: 15,
				motd: ""
			};
			doc.songCount++;
			doc.save();
			if (err) {
				console.log(err);
			}
			if (doc.enabled) {
				if (doc.songCount % doc.interval === 0) {
					bot.sendChat(bot.identifier + doc.motd);
				}
			}
		});
	};*/
	bot.on('chat-message', function (data) {
		var cmd = data.message,
			//split the whole message words into tokens
			tokens = cmd.split(" "),
			// array of the command triggers
			parsedCommands = [];
		//command handler
		tokens.forEach(function (token) {
			if (token.substr(0, 1) === '!' && parsedCommands.indexOf(token.substr(1)) == -1) {
				// add the command used to the data sent from the chat to be used later
				data.trigger = token.substr(1).toLowerCase();
				parsedCommands.push(data.trigger);

				//if very first token, it's a command and we need to grab the params (if any) and add to the data sent from chat
				if (tokens.indexOf(token) === 0) {
					//the params are an array of the remaining tokens
					data.params = tokens.slice(1);

					switch (typeof (commands[data.trigger])) {
						case 'string':
							bot.sendChat(bot.identifier + commands[data.trigger]);
							break;
						case 'function':
							//little trick to give the commands the bot to use its functions and also the data from the chat
							commands[data.trigger].apply(bot, [data]);
							break;
					}
				}
			}
			//check to see if any of the words match an emoji
			else if (bot.emojis.indexOf(token) > -1) {
				//if it does, find or create db entery, incrementing the count
				bot.db.models.EmojiCount.findOne({
					emoji: token
				}, function (err, doc) {
					console.log(doc);
					doc = doc || {
						emoji: token,
						count: 0
					};
					doc.count++;
					doc.save();
				});
			}
		});
		//DB store
		//only storing the chat ID's, user IDs, and username so that the DB file doesn't get too big yo!
		var chatSchema = {
			username: data.user.username,
			chatid: data.raw.chatid
		}
		bot.db.models.Chat.create(chatSchema, function (err, chat) {
			if (err) {
				console.log(err);
			}
		});
	});
	bot.on('room_playlist-update', function (data) {
		//bot.sendMotd();
		var date = new Date();
		//checks to see if it's within the first hour of the day
		if (date.getHours() === 0) {
			var remove = bot.emojis.indexOf(bot.identifier.trim());
			if (remove !== -1) {
				bot.emojis.splice(remove, 1);
			}
			//checks to see if it's Monday
			if (date.getDay() === 1) {
				//checks to see if the days entry has been paused, if not insert into days tracker and pause
				if (!bot.emojisPause) {
					var emojis = [];
					bot.emojisPause = true;
					bot.emojis.forEach(function (emoji, index, arr) {
						if (index === arr.length - 1) {
							//this manages to fire before adding the emojis to the emojis array without the timeout
							setTimeout(function () {
								var emojiDaySchema = {
									date: date,
									emojis: emojis
								}
								bot.db.models.EmojiTrackDays.create(emojiDaySchema, function (err, doc) {
									if (err) {
										console.log(err)
									}
								});
							}, 2000);
						} else {
							bot.db.models.EmojiCount.findOne({
								emoji: emoji
							}, function (err, doc) {
								if (err) {
									console.log(err);
								}
								if (doc) {
									var count = {
										emojiName: emoji,
										count: doc.count
									};
									emojis.push(count);
								}
							});
						}
					});
				}
				//checks to see if the emojis have already been reset, if not insert into weeks tracker
				if (!bot.emojisReset) {
					var emojis = [];
					bot.emojisReset = true;
					bot.emojis.forEach(function (emoji, index, arr) {
						if (index === arr.length - 1) {
							//this manages to fire before adding the emojis to the emojis array without the timeout
							setTimeout(function () {
								var emojiWeekSchema = {
									date: date,
									emojis: emojis
								}
								bot.db.models.EmojiTrackWeeks.create(emojiWeekSchema, function (err, doc) {
									if (err) {
										console.log(err)
									}
								});
							}, 2000);
						} else {
							bot.db.models.EmojiCount.findOne({
								emoji: emoji
							}, function (err, doc) {
								if (err) {
									console.log(err);
								}
								if (doc) {
									var count = {
										emojiName: emoji,
										count: doc.count
									};
									emojis.push(count);
									doc.count = 0;
									doc.save();
								}
							});
						}
					});
				}
			} else {
				if (bot.emojisReset) {
					//safe to remove the reset protection when it's not monday
					bot.emojisReset = false;
				}
				//checks to see if the days entry has been paused, if not insert into days tracker and pause
				if (!bot.emojisPause) {
					var emojis = [];
					bot.emojisPause = true;
					bot.emojis.forEach(function (emoji, index, array) {
						if (index === array.length - 1) {
							//this manages to fire before adding the emojis to the emojis array without the timeout
							setTimeout(function () {
								var emojiDaySchema = {
									date: date,
									emojis: emojis
								}
								console.log(emojis);
								bot.db.models.EmojiTrackDays.create(emojiDaySchema, function (err, doc) {
									if (err) {
										console.log(err)
									}
								});
							}, 5000);
						} else {
							bot.db.models.EmojiCount.findOne({
								emoji: emoji
							}, function (err, doc) {
								if (err) {
									console.log(err);
								}
								if (doc) {
									var count = {
										emojiName: emoji,
										count: doc.count
									};
									emojis.push(count);
									console.log(emojis);
								}
							});
						}
					});
				}
			}
		} else {
			if (bot.emojisPause) {
				//safe to remove the pause protection when it's not within the first hour
				bot.emojisPause = false;
			}
		}
	});
	console.log('DubAPI Version: ' + bot.version);

	function connect() {
		bot.connect('just-a-chill-room');
	}

	bot.on('connected', function (name) {
		bot.sendChat(bot.identifier + "online! ver: " + pkg.version);
		console.log('Bot Version: ' + pkg.version);
		console.log('Connected to ' + name);
		console.log('on71n3');
	});

	bot.on('disconnected', function (name) {
		console.log('Disconnected from ' + name);
		setTimeout(connect, 15000);
	});

	bot.on('error', function (err) {
		console.error(err);
	});
	connect();
});
