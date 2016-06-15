// jshint esversion: 6
// jshint strict: true
// jshint node: true
// jshint asi: true
"use strict";

var Fs = require("fs"),
    Path = require("path");

module.exports = (bot) => {
    var commands = {};
    var dir = process.cwd() + "/bot/commands";
    
    Fs.readdirSync(dir).forEach((file) => {
        var _path = Path.resolve(dir, file);
        Fs.stat(_path, (err, stat) => {
            if (stat && !stat.isDirectory()) {
                if (file.indexOf(".js") > -1) {
                    // add extra commands set in file if they exist
                    if(typeof(require(_path).extra) !== "undefined") {
                        if(Array.isArray(require(_path).extra)) {
                            // add each command in array into overall commands
                            require(_path).extra.forEach((command) => {
                                commands[command] = require(_path);
                            });
                        }
                        else {
                            throw new TypeError("Invalid extra commands export for file: " + _path);
                        }
                    }
                    commands[file.split(".")[0]] = require(_path);
                }
            }
        });
    });

    bot.on("chat-message", (data) => {
        if (typeof(data.user) === "undefined") {
            return
        }

        if (data.message.match(/(\[AFK\].*https?:\/\/.*\.(?:png|jpg|gif))/i)) {
            bot.moderateDeleteChat(data.raw.chatid);
            bot.sendChat(bot.identifier + "@" + data.user.username + " - image/gif AFK responses are not allowed.");
            return
        } 


        bot.db.models.person.findOne({
            uid: data.user.id
        }, (err, person) => {
            if (err) {
                bot.log("error", "BOT", err);
                return
            } 

            if (!person) {
                person = new bot.db.models.person({
                    uid: data.user.id
                });
            }

            person.username = data.user.username;
            person.dubs = data.user.dubs;
            person.lastChat = new Date();
            person.save();
        });

        var cmd = data.message,
            //split the whole message words into tokens
            tokens = cmd.split(" "),
            // array of the command triggers
            parsedCommands = [];

        //command handler
        tokens.forEach((token) => {
            if (token.charAt(0) === "!" && parsedCommands.indexOf(token.substr(1)) == -1) {}
            else { return }

            // add the command used to the data sent from the chat to be used later
            data.trigger = token.substr(1).toLowerCase();
            parsedCommands.push(data.trigger);

            //if very first token, it's a command and we need to grab the params (if any) and add to the data sent from chat
            if (tokens.indexOf(token) !== 0) {
                return
            }

            //the params are an array of the remaining tokens
            data.params = tokens.slice(1);
            //exec command
            if (typeof(commands[data.trigger]) !== "undefined") {
                commands[data.trigger](bot, data);
                return
            } 
            
            bot.db.models.commands.findOne({
                name: data.trigger
            }).populate("aliasOf").exec( (err, doc) => {
                if (err) {
                    bot.log("error", "MONGO", err);
                    return
                } 
                if (doc) {
                    if (doc.aliasOf) {
                        doc = doc.aliasOf
                    }
                
                    if ((doc.cmdType === "img")||(doc.cmdType==="info")) {
                        const image = doc.response[Math.floor(Math.random() * doc.response.length)];
                        bot.sendChat(image);
                    } else if (doc.cmdType === "info") {
                        bot.sendChat(doc.response);
                    }
                }
            });
        });
        //DB store
        //only storing the chat ID's, user IDs, and username so that the DB file doesn't get too big yo!
        const chatSchema = {
            username: data.user.username,
            chatid: data.raw.chatid
        };
        bot.db.models.chat.create(chatSchema, (err) => {
            if (err) {
                bot.log("error", "BOT", err);
            }
        });
        
    });
};
