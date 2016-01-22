module.exports = function (bot) {
	var memes = [
		"https://api.plugable.info/image/56a240b80684bf9ec48f7c4c.png"
	];
	var post = memes[Math.floor(Math.random() * memes.length)];
	bot.sendChat(post);
};
