// Copyright (c) Qais Patankar 2016 - MIT License

let bot;
const event = require('./events/chat-message.js');

function onCommand() {
	bot.sendChatTemp("Hello world!", null, 1000);
}

module.exports.init = function init(receivedBot) {
	bot = receivedBot;

	event.AddCommand('test', onCommand);
};
