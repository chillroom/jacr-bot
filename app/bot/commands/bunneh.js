module.exports = function (bot) {
	var bunnehs = [
		"http://cdn.earthporm.com/wp-content/uploads/2014/07/cute-bunnies-tongues-6.jpg",
		"http://viralpirate.com/wp-content/uploads/2015/09/Happy_bunny_Wallpaper_btzqo.jpg",
		"http://i.imgur.com/5nGWQWK.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Wild_rabbit_us.jpg/1280px-Wild_rabbit_us.jpg"
	];
	var bunneh = bunnehs[Math.floor(Math.random() * bunnehs.length)];
	bot.sendChat(bunneh);
};
