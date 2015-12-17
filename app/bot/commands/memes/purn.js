module.exports = function (bot) {
	var memes = [
		"http://puu.sh/lrdTh/a7e4a53a2d.jpg",
		"http://puu.sh/lrdTh/a7e4a53a2d.jpg",
		"http://i.imgur.com/qNbCr4g.gif"
	];
	var post = memes[Math.floor(Math.random() * memes.length)];
	bot.sendChat(post);
};
