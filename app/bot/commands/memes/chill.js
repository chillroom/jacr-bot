module.exports = function(bot) {
    var memes = [
        "http://i.imgur.com/7IDkIw8.jpg",
        "http://imgur.com/3IuSnRg.gif"
    ];
    var post = memes[Math.floor(Math.random() * memes.length)];
    bot.sendChat(post);
};