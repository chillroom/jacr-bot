// jshint esversion: 6
// jshint strict: true
// jshint node: true
// jshint asi: true
"use strict";

var Fs = require("fs"),
    Path = require("path");
var bot
var commands = {};

var ChatMessageEvent = function (_bot) {
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

    bot = _bot
    loadResponses()
    _bot.on("chat-message", onChatMessage)
};

ChatMessageEvent.AddCommand = function(cmd, fn) {
    commands[cmd] = fn;
}

module.exports = ChatMessageEvent

var responses = {}
const r = require ("rethinkdb")
function loadResponses() {
    r.table('responses').filter(r.row.getField("site").eq("dubtrack"), {default:true}).run(bot.rethink, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            if (err) throw err;
            for (var i = result.length - 1; i >= 0; i--) {
                var doc = result[i]
                responses[doc.name] = doc.responses

                for (var k = doc.aliases.length - 1; k >= 0; k--) {
                    responses[doc.aliases[k]] = doc.responses
                }
            }
        });
    });
}

const MOTD = require("../motd.js")

function onChatMessage (data) {
    if (typeof(data.user) === "undefined") {
        return
    }

    if (data.message.match(/(\[AFK\].*https?:\/\/.*\.(?:png|jpg|gif))/i)) {
        bot.moderateDeleteChat(data.raw.chatid);
        bot.sendChat(bot.identifier + "@" + data.user.username + " - image/gif AFK responses are not allowed.");
        return
    } 

    // Alert the MOTD manager to the message
    MOTD.onChat();


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
        
        if (responses[data.trigger] != null) {
            var resp = responses[data.trigger]
            const image = resp[Math.floor(Math.random() * resp.length)];
            bot.sendChat(image);
        }

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
    
}