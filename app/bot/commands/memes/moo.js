module.exports = function(bot) {
    var memes = [
        "http://i.imgur.com/2P6XJDk.gif"
    ];
    var post = memes[Math.floor(Math.random() * memes.length)];
    bot.sendChat(post);
};