// jshint esversion: 6
// jshint strict: true
// jshint node: true
// jshint asi: true
// Copyright (c) Qais Patankar 2016 - MIT License
"use strict";

var MOTD = {
	settings: {}
};
var bot;

MOTD.init = function(receivedBot) {
	bot = receivedBot;
	MOTD.updateInformation();
};

MOTD.onAdvance = function() {

};

// updateInformation triggers information reloading
MOTD.updateInformation = function() {
	// const r = require ("rethinkdb")
	// r.table('settings').get("motd").run(bot.rethink, function(err, cursor) {
 //        if (err) throw err;
 //        cursor.toArray(function(err, result) {
 //            if (err) throw err;
 //            for (var i = result.length - 1; i >= 0; i--) {
 //                var doc = result[i]
 //                responses[doc.name] = doc.responses

 //                for (var k = doc.aliases.length - 1; k >= 0; k--) {
 //                    responses[doc.aliases[k]] = doc.responses
 //                }
 //            }
 //        });
 //    });
};

module.exports = MOTD;
