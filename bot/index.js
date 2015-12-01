var DubAPI = require('dubapi'),
	Datastore = require('nedb'),
	pkg = require('../package.json'),
	commands = require('./commands');

new DubAPI({
	username: 'nitrowhore',
	password: 'Fedora1502'
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
	bot.db = {};
	//as we may extend the use of DB's in the future
	//setting up DB as an object to seperate each DB into its own collection
	//chat DB
	bot.db.chat = new Datastore({
		filename: __dirname + "/db/chat.db",
		autoload: true,
		inMemoryOnly: false,
		timestampData: true
	});
	//MOTD settings for persistence
	bot.db.motd = new Datastore({
		filename: __dirname + "/db/motd.db",
		autoload: true,
		inMemoryOnly: false,
		timestampData: true
	});
	//emojiCount DB
	bot.db.emojiCount = new Datastore({
		filename: __dirname + "/db/emojiCount.db",
		autoload: true,
		inMemoryOnly: false,
		timestampData: true
	});
	//emoji track days DB
	bot.db.emojiTrackDays = new Datastore({
		filename: __dirname + "/db/emojiTrackDays.db",
		autoload: true,
		inMemoryOnly: false,
		timestampData: true
	});
	//emoji track Weeks DB
	bot.db.emojiTrackWeeks = new Datastore({
		filename: __dirname + "/db/emojiTrackWeeks.db",
		autoload: true,
		inMemoryOnly: false,
		timestampData: true
	});
	//function to send MOTD based off the number of songs played
	bot.sendMotd = function () {
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
			bot.db.motd.update({
				_id: 1
			}, doc, {
				upsert: true
			}, function (err, num) {
				if (err) {
					console.log(err);
				}
			});
			if (err) {
				console.log(err);
			}
			if (doc.enabled) {
				if (doc.songCount % doc.interval === 0) {
					bot.sendChat(bot.identifier + doc.motd);
				}
			}
		});
	};
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
				bot.db.emojiCount.findOne({
					emoji: token
				}, function (err, doc) {
					doc = doc || {
						emoji: token,
						count: 0
					};
					doc.count++
						bot.db.emojiCount.update({
							emoji: token
						}, doc, {
							upsert: true
						}, function (err, num) {
							if (err) {
								console.log(err);
							}
						});
				});
			}
		});
		//DB store
		//only storing the chat ID's, user IDs, and username so that the DB file doesn't get too big yo! 
		var chatSchema = {
			chatid: data.raw.chatid,
			userid: data.user.id,
			username: data.user.username
		};
		bot.db.chat.insert(chatSchema, function (err, docs) {
			if (err) {
				console.log(err);
			}
		});

	});
	bot.on('room_playlist-update', function (data) {
		bot.sendMotd();
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
								bot.db.emojiTrackDays.insert(emojiDaySchema, function (err, doc) {
									if (err) {
										console.log(err)
									}
								});
							}, 2000);
						} else {
							bot.db.emojiCount.findOne({
								emoji: emoji
							}, function (err, doc) {
								if (err) {
									console.log(err);
								}
								if (doc) {
									var count = {};
									count[emoji] = doc.count;
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
								bot.db.emojiTrackWeeks.insert(emojiWeekSchema, function (err, doc) {
									if (err) {
										console.log(err)
									}
								});
							}, 2000);
						} else {
							bot.db.emojiCount.findOne({
								emoji: emoji
							}, function (err, doc) {
								if (err) {
									console.log(err);
								}
								if (doc) {
									var count = {};
									count[emoji] = doc.count;
									emojis.push(count);
									doc.count = 0;
									bot.db.emojiCount.update({
										emoji: emoji
									}, doc, {
										upsert: true
									}, function (err, num) {
										if (err) {
											console.log(err);
										}
									});
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
								bot.db.emojiTrackDays.insert(emojiDaySchema, function (err, doc) {
									if (err) {
										console.log(err)
									}
								});
							}, 2000);
						} else {
							bot.db.emojiCount.findOne({
								emoji: emoji
							}, function (err, doc) {
								if (err) {
									console.log(err);
								}
								if (doc) {
									var count = {};
									count[emoji] = doc.count;
									emojis.push(count);
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
		bot.connect('nitrowhore');
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