var fs = require("fs"),
    path = require("path");

module.exports = function(bot) {
    var commands = {},
        cmd = process.cwd() + "/app/bot/commands";
    var walk = function(dir) {
        fs.readdirSync(dir).forEach(function(file) {
            var _path = path.resolve(dir, file);
            fs.stat(_path, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(_path);
                } else {
                    if (file.indexOf(".js") > -1) {
                        commands[file.split(".")[0]] = require(_path);
                    }

                }
            });
        });
    };
    walk(cmd);
    bot.on("chat-message", function(data) {
        if (typeof(data.user) !== "undefined") {
            if (data.message.match(/(\[AFK\].*https?:\/\/.*\.(?:png|jpg|gif))/i)) {
                bot.moderateDeleteChat(data.raw.chatid);
                bot.sendChat(bot.identifier + "@" + data.user.username + " nitroghost is a sour puss and has banned image/gif AFK responses. pls change it, k thanks bai!");
            } else {
                bot.db.models.person.findOne({
                    uid: data.user.id
                }, function(err, person) {
                    if (err) {
                        bot.log("error", "BOT", err);
                    } else {
                        if (!person) {
                            person = new bot.db.models.person({
                                uid: data.user.id
                            });
                        }
                        var moderator = {
                            isMod: false
                        };
                        if (bot.isMod(data.user)) {
                            moderator["type"] = "mod";
                            moderator["isMod"] = true;
                        } else if (bot.isManager(data.user)) {
                            moderator["type"] = "manager";
                            moderator["isMod"] = true;
                        } else if (bot.isOwner(data.user)) {
                            moderator["type"] = "co-owner";
                            moderator["isMod"] = true;
                        }
                        if (moderator.isMod) {
                            person.rank.name = moderator.type;
                            person.rank.rid = data.user.role;
                        }
                        person.username = data.user.username;
                        person.dubs = data.user.dubs;
                        person.lastChat = new Date();
                        person.save();
                    }
                });
                var cmd = data.message,
                    //split the whole message words into tokens
                    tokens = cmd.split(" "),
                    // array of the command triggers
                    parsedCommands = [];
                //command handler
                tokens.forEach(function(token) {
                    if (token.substr(0, 1) === "!" && parsedCommands.indexOf(token.substr(1)) == -1) {
                        // add the command used to the data sent from the chat to be used later
                        data.trigger = token.substr(1).toLowerCase();
                        parsedCommands.push(data.trigger);

                        //if very first token, it's a command and we need to grab the params (if any) and add to the data sent from chat
                        if (tokens.indexOf(token) === 0) {
                            //the params are an array of the remaining tokens
                            data.params = tokens.slice(1);
                            //exec command
                            if (typeof(commands[data.trigger]) !== "undefined") {
                                commands[data.trigger](bot, data);
                            }
                        }
                    }
                    //check to see if any of the words match an emoji
                    else if (bot.emojis.indexOf(token) > -1) {
                        //if it does, find or create db entery, incrementing the count
                        setTimeout(function() {
                            bot.db.models.emojiCount.findOne({
                                emoji: token
                            }, function(err, doc) {
                                if (doc) {
                                    doc.count++;
                                    doc.save();
                                } else {
                                    doc = {
                                        emoji: token,
                                        count: 0
                                    };
                                    doc.count++;
                                    bot.db.models.emojiCount.create(doc, function(err) {
                                        if (err) {
                                            bot.log("error", "BOT", err);
                                        }
                                    });
                                }
                                if (err) {
                                    bot.log("error", "BOT", err);
                                }
                            });
                        }, 2000);
                    }
                });
                //DB store
                //only storing the chat ID's, user IDs, and username so that the DB file doesn't get too big yo!
                var chatSchema = {
                    username: data.user.username,
                    chatid: data.raw.chatid
                };
                bot.db.models.chat.create(chatSchema, function(err) {
                    if (err) {
                        bot.log("error", "BOT", err);
                    }
                });
            }
        }
    });
};
