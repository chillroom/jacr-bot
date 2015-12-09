module.exports = function (bot) {
	var memes = [
		"http://fistfuloftalent.com/wp-content/uploads/2015/05/no-thank-you-gif.gif",
		"http://media.tumblr.com/0a967a7fdb105de3cbe5266fa084fdb7/tumblr_inline_mtql5epdaQ1qznfri.gif",
		"http://assets0.ordienetworks.com/images/GifGuide/michael_scott/The-Office-gifs-the-office-14948948-240-196.gif"
	];
	var post = memes[Math.floor(Math.random() * memes.length)];
	bot.sendChat(post);
};
