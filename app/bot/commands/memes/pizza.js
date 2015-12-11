module.exports = function (bot) {
	var pizzas = [
		"https://img.pandawhale.com/post-8630-Homer-Simpson-backs-into-peppe-o3R8.gif",
		"https://s-media-cache-ak0.pinimg.com/236x/2b/d5/ec/2bd5ec398f08334daea25dbed9b09bbc.jpg",
		"http://iruntheinternet.com/lulzdump/images/sounds-delicious-pizza-record-player-LP-vinyl-13583317950.jpg",
		"http://funguerilla.com/wp-content/uploads/2010/06/funny-pizza-images17-.jpg",
		"https://t3hwin.com/i/2014/12/Pizza-baby.jpg",
		"http://i.imgur.com/waVOxEQ.gif"
	];
	var pizza = pizzas[Math.floor(Math.random() * pizzas.length)];
	bot.sendChat(pizza);
};
