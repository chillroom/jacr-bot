// Copyright (c) Qais Patankar 2016 - MIT License

let r;
let bot;
const event = require('./events/chat-message.js');

function onCommand() {
	bot.sendChatTemp("Hello world!", null, 1000);
}

module.exports.init = function init(receivedBot) {
	bot = receivedBot;
	r = bot.rethink;

	event.AddCommand('test', onCommand);
};
