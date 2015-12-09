module.exports = function (bot) {
	var memes = [
		"http://i.imgur.com/y7Pa6A5.jpg",
		"http://i.imgur.com/N9RyuI0.jpg"
	];
	var post = memes[Math.floor(Math.random() * memes.length)];
	bot.sendChat(post);
};
